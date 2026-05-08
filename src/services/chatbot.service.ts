/**
 * Chatbot service — dùng Google Gemini với function calling
 * để gợi ý shop, tìm kiếm dịch vụ, và hỗ trợ booking.
 */
import { shopService, ShopPublicResponse } from './shop.service';
import { bookingService } from './booking.service';
import { petService } from './pet.service';
import type { ServiceResponse } from '../types/api';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  /** Kết quả tool call đính kèm (shop cards, booking confirm, v.v.) */
  toolResult?: ToolResult;
}

export type ToolResult =
  | { type: 'shop_list'; shops: ShopWithServices[] }
  | { type: 'shop_detail'; shop: ShopPublicResponse; services: ServiceResponse[] }
  | { type: 'pet_list'; pets: PetSummary[] }
  | { type: 'pet_detail'; pet: PetDetail }
  | { type: 'booking_picker'; shopId: number; shopName: string; serviceId: number; serviceName: string; servicePrice: number; petId: number; petName: string }
  | { type: 'booking_success'; bookingId: number; shopName: string; serviceName: string; datetime: string }
  | { type: 'error'; message: string };

export interface PetSummary {
  id: number;
  name: string;
  species: string;
  breed: string;
  gender: string;
  weight: number;
  age: string;
  avatar?: string;
  healthNote?: string;
  allergies?: string;
  sterilized: boolean;
}

export interface PetDetail extends PetSummary {
  color?: string;
  dob?: string;
  favoriteFood?: string;
  hobbies?: string;
  walkTime?: string;
  vaccinations?: { name: string; date: string; status: string }[];
  upcomingReminders?: { title: string; date: string; type: string }[];
}

export interface ShopWithServices {
  shop: ShopPublicResponse;
  services: ServiceResponse[];
}

export interface BookingDraft {
  shopId: number;
  shopName: string;
  serviceId: number;
  serviceName: string;
  servicePrice: number;
  petId: number;
  petName: string;
  appointmentDatetime: string;
  note?: string;
}

// ─── Gemini API call ──────────────────────────────────────────────────────────

const GEMINI_API_KEY = import.meta.env.VITE_GEMINI_API_KEY as string | undefined;
// Danh sách model fallback — đã test với key hiện tại (May 2026)
// ✅ gemini-2.5-flash, gemini-2.5-flash-lite, gemini-flash-latest hoạt động tốt
// ❌ gemini-2.0-flash, gemini-2.0-flash-lite đang bị 429 rate limit
const GEMINI_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-flash-lite',
  'gemini-flash-latest',
  'gemini-2.0-flash',
  'gemini-2.0-flash-lite',
];
const GEMINI_BASE = 'https://generativelanguage.googleapis.com/v1beta/models';

interface GeminiPart {
  text?: string;
  functionCall?: { name: string; args: Record<string, unknown> };
  functionResponse?: { name: string; response: Record<string, unknown> };
}

interface GeminiContent {
  role: 'user' | 'model';
  parts: GeminiPart[];
}

/** Gọi 1 model cụ thể, throw nếu lỗi */
async function callModel(
  model: string,
  body: object,
): Promise<{ text?: string; functionCall?: { name: string; args: Record<string, unknown> } }> {
  
  // 1. Chuẩn hóa Model Path
  const modelPath = model.startsWith('models/') ? model : `models/${model}`;
  
  // 2. Tạo URL chuẩn
  const url = `https://generativelanguage.googleapis.com/v1beta/${modelPath}:generateContent?key=${GEMINI_API_KEY}`;

  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    const message = errData.error?.message || 'Unknown error';
    const err = new Error(`[${model}] HTTP ${res.status}: ${message}`);
    (err as any).status = res.status;
    throw err;
  }

  const data = await res.json();
  const part = data.candidates?.[0]?.content?.parts?.[0];

  if (part?.functionCall) return { functionCall: part.functionCall };
  if (part?.text) return { text: part.text };
  
  return { text: 'Xin lỗi, tôi không nhận được phản hồi.' };
}

/** Thử lần lượt các model, fallback khi 503/429 */
async function callGemini(
  contents: GeminiContent[],
  tools: object[],
  systemInstruction: string,
): Promise<{ text?: string; functionCall?: { name: string; args: Record<string, unknown> } }> {
  if (!GEMINI_API_KEY) throw new Error('VITE_GEMINI_API_KEY chưa được cấu hình');

  const body = {
    system_instruction: { parts: [{ text: systemInstruction }] },
    contents,
    tools: [{ function_declarations: tools }],
    generationConfig: { temperature: 0.7, maxOutputTokens: 1024 },
  };

  let lastError: Error | null = null;

  for (const model of GEMINI_MODELS) {
    try {
      const result = await callModel(model, body);
      return result;
    } catch (err: any) {
      lastError = err;
      const status = err?.status as number | undefined;
      // Chỉ fallback khi 503 (overloaded) hoặc 429 (rate limit)
      if (status === 503 || status === 429) {
        console.warn(`[Chatbot] ${model} unavailable (${status}), trying next model...`);
        // Chờ 500ms trước khi thử model tiếp theo
        await new Promise((r) => setTimeout(r, 500));
        continue;
      }
      // Lỗi khác (400, 401...) → throw ngay
      throw err;
    }
  }

  throw lastError ?? new Error('Tất cả model đều không khả dụng');
}

// ─── Tool definitions ─────────────────────────────────────────────────────────

const TOOL_DEFINITIONS = [
  {
    name: 'search_shops',
    description: 'Tìm kiếm các shop thú cưng. Dùng khi user hỏi về shop hoặc muốn tìm nơi chăm sóc thú cưng theo tên shop hoặc thành phố.',
    parameters: {
      type: 'object',
      properties: {
        keyword: { type: 'string', description: 'Từ khóa tìm kiếm tên shop' },
        city: { type: 'string', description: 'Thành phố (ví dụ: Hà Nội, TP.HCM)' },
        shopType: { type: 'string', description: 'Loại shop: GROOMING, CLINIC, BOARDING, SPA' },
        sortByRating: { type: 'boolean', description: 'Sắp xếp theo đánh giá cao nhất' },
      },
    },
  },
  {
    name: 'search_by_service',
    description: 'Tìm kiếm shop theo tên dịch vụ cụ thể (ví dụ: tắm, cắt lông, tiêm phòng, lưu trú, grooming, spa, khám bệnh). Trả về top 5 shop có dịch vụ phù hợp, sắp xếp theo đánh giá cao nhất.',
    parameters: {
      type: 'object',
      properties: {
        serviceKeyword: {
          type: 'string',
          description: 'Tên dịch vụ cần tìm, ví dụ: tắm, cắt lông, tiêm phòng, lưu trú, grooming, spa, khám tổng quát',
        },
        city: { type: 'string', description: 'Lọc theo thành phố (tuỳ chọn)' },
        topN: { type: 'number', description: 'Số lượng shop trả về, mặc định 5' },
      },
      required: ['serviceKeyword'],
    },
  },
  {
    name: 'get_shop_detail',
    description: 'Lấy thông tin chi tiết của một shop cụ thể bao gồm dịch vụ, giá cả, đánh giá. Dùng khi user muốn biết thêm về một shop.',
    parameters: {
      type: 'object',
      properties: {
        shopId: { type: 'number', description: 'ID của shop' },
      },
      required: ['shopId'],
    },
  },
  {
    name: 'prepare_booking',
    description: 'Tự động tìm shop, dịch vụ, thú cưng phù hợp rồi hiển thị form chọn ngày giờ để đặt lịch. Dùng ngay khi user muốn đặt lịch với thông tin như tên shop, tên dịch vụ, tên thú cưng — KHÔNG cần hỏi thêm ID hay ngày giờ.',
    parameters: {
      type: 'object',
      properties: {
        shopName: { type: 'string', description: 'Tên shop (một phần cũng được, ví dụ: PetCareSG, PetCare)' },
        serviceKeyword: { type: 'string', description: 'Tên dịch vụ cần đặt, ví dụ: tắm, cắt lông, tiêm phòng' },
        petName: { type: 'string', description: 'Tên thú cưng (một phần cũng được, ví dụ: Mèo, Mimi)' },
      },
      required: ['serviceKeyword'],
    },
  },
  {
    name: 'create_booking',
    description: 'Tạo booking sau khi đã có đủ shopId, serviceId, petId VÀ appointmentDatetime. Chỉ gọi khi user đã chọn ngày giờ cụ thể.',
    parameters: {
      type: 'object',
      properties: {
        shopId: { type: 'number', description: 'ID shop' },
        serviceId: { type: 'number', description: 'ID dịch vụ' },
        petId: { type: 'number', description: 'ID thú cưng' },
        appointmentDatetime: { type: 'string', description: 'Ngày giờ hẹn định dạng ISO: 2025-06-15T10:00:00' },
        note: { type: 'string', description: 'Ghi chú thêm (tuỳ chọn)' },
      },
      required: ['shopId', 'serviceId', 'petId', 'appointmentDatetime'],
    },
  },
  {
    name: 'get_my_pets',
    description: 'Lấy danh sách thú cưng của người dùng hiện tại với đầy đủ thông tin: tên, loài, giống, tuổi, cân nặng, sức khỏe, dị ứng, lịch tiêm phòng. Dùng khi user hỏi về thú cưng của họ hoặc cần biết thú cưng nào để booking.',
    parameters: {
      type: 'object',
      properties: {
        petId: { type: 'number', description: 'ID thú cưng cụ thể muốn xem chi tiết (tuỳ chọn, nếu không có thì lấy tất cả)' },
      },
    },
  },
];

// ─── System prompt ────────────────────────────────────────────────────────────

const SYSTEM_PROMPT = `Bạn là PetEye Assistant — trợ lý AI thông minh của ứng dụng PetEye, chuyên hỗ trợ chủ thú cưng tìm kiếm và đặt lịch dịch vụ chăm sóc thú cưng.

Nhiệm vụ của bạn:
1. Gợi ý shop phù hợp dựa trên yêu cầu của user (loại dịch vụ, vị trí, ngân sách)
2. Ưu tiên shop có đánh giá cao (ratingAvg) khi gợi ý
3. Cung cấp thông tin chi tiết về shop: dịch vụ, giá cả, mô tả
4. Hỗ trợ đặt lịch tự động khi user đồng ý
5. Tư vấn chăm sóc thú cưng dựa trên thông tin pet của user (loài, giống, tuổi, sức khỏe, dị ứng)
6. Trả lời bằng tiếng Việt, thân thiện và ngắn gọn

Quy tắc chọn tool:
- Khi user muốn ĐẶT LỊCH với tên shop + dịch vụ + tên thú cưng → dùng NGAY prepare_booking (KHÔNG hỏi thêm)
- Khi user hỏi về thú cưng của họ → dùng get_my_pets
- Khi user hỏi về dịch vụ cụ thể (tắm, cắt lông, tiêm phòng...) → dùng search_by_service
- Khi user hỏi về shop theo tên hoặc thành phố → dùng search_shops
- Khi user muốn xem chi tiết 1 shop → dùng get_shop_detail
- Khi user đã chọn ngày giờ cụ thể → dùng create_booking
- Nếu user chưa đăng nhập, nhắc họ đăng nhập để đặt lịch
- Không bịa thông tin về shop hay pet, chỉ dùng dữ liệu từ tool
- Khi hiển thị giá, dùng định dạng: 150.000đ
- Khi tư vấn dịch vụ, hãy xem xét thông tin pet (dị ứng, sức khỏe) để gợi ý phù hợp

Ví dụ: "đặt lịch đưa Mèo đi tắm ở PetCareSG" → gọi prepare_booking{shopName:"PetCareSG", serviceKeyword:"tắm", petName:"Mèo"} NGAY, không hỏi thêm`;

// ─── Main chatbot engine ──────────────────────────────────────────────────────

export interface ChatbotContext {
  userId?: number;
  userEmail?: string;
  userName?: string;
}

export async function sendChatMessage(
  userMessage: string,
  history: ChatMessage[],
  context: ChatbotContext,
): Promise<{ text: string; toolResult?: ToolResult }> {
  // Build Gemini conversation history — chỉ lấy các cặp user/assistant xen kẽ
  // Bỏ message đầu tiên của assistant (welcome message) vì nó không phải do user trigger
  const chatHistory = history.filter((m) => m.content.trim() !== '');

  // Đảm bảo xen kẽ đúng: user → model → user → model...
  // Lấy tối đa 8 messages gần nhất, bắt đầu từ user
  const recentHistory = chatHistory.slice(-8);
  const geminiHistory: GeminiContent[] = [];

  for (const msg of recentHistory) {
    const role: 'user' | 'model' = msg.role === 'user' ? 'user' : 'model';
    // Tránh 2 role giống nhau liên tiếp
    if (geminiHistory.length > 0 && geminiHistory[geminiHistory.length - 1].role === role) continue;
    if (msg.content.trim()) {
      geminiHistory.push({ role, parts: [{ text: msg.content }] });
    }
  }

  // Đảm bảo history bắt đầu bằng user (nếu không thì bỏ phần đầu)
  while (geminiHistory.length > 0 && geminiHistory[0].role !== 'user') {
    geminiHistory.shift();
  }

  // Thêm message hiện tại của user
  // Nếu history cuối cũng là user thì merge hoặc bỏ
  if (geminiHistory.length > 0 && geminiHistory[geminiHistory.length - 1].role === 'user') {
    geminiHistory.pop(); // bỏ để tránh duplicate
  }
  geminiHistory.push({ role: 'user', parts: [{ text: userMessage }] });

  // Inject context vào system prompt
  const systemWithContext = SYSTEM_PROMPT + (
    context.userId
      ? `\n\nThông tin user hiện tại: Tên: ${context.userName ?? 'Khách'}, Email: ${context.userEmail}, ID: ${context.userId}`
      : '\n\nUser chưa đăng nhập.'
  );

  // Gọi Gemini lần 1
  let firstResponse: { text?: string; functionCall?: { name: string; args: Record<string, unknown> } };
  try {
    firstResponse = await callGemini(geminiHistory, TOOL_DEFINITIONS, systemWithContext);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Chatbot] Gemini call 1 failed:', msg);
    return { text: `Lỗi kết nối AI: ${msg.slice(0, 120)}` };
  }

  // Nếu không có function call → trả về text trực tiếp
  if (!firstResponse.functionCall) {
    return { text: firstResponse.text ?? 'Xin lỗi, có lỗi xảy ra.' };
  }

  // ── Thực thi tool ─────────────────────────────────────────────────────────
  const { name, args } = firstResponse.functionCall;
  let toolResult: ToolResult | undefined;
  let toolResponseData: Record<string, unknown> = {};

  try {
    if (name === 'search_by_service') {
      // ── Tìm theo tên dịch vụ ──────────────────────────────────────────────
      const serviceKeyword = (args.serviceKeyword as string).toLowerCase().trim();
      const cityFilter = args.city as string | undefined;
      const topN = (args.topN as number | undefined) ?? 5;

      // Lấy tất cả shops (có thể filter theo city)
      const allShops = await shopService.searchPublic({ city: cityFilter });

      // Fetch services của tất cả shops song song
      const shopsWithServices: ShopWithServices[] = await Promise.all(
        allShops.map(async (shop) => {
          const services = await shopService.getShopServices(shop.id).catch(() => []);
          return { shop, services };
        }),
      );

      // Filter: chỉ giữ shop có ít nhất 1 dịch vụ match keyword
      const matched = shopsWithServices.filter(({ services }) =>
        services.some((svc) =>
          svc.serviceName.toLowerCase().includes(serviceKeyword) ||
          (svc.description ?? '').toLowerCase().includes(serviceKeyword) ||
          svc.category.toLowerCase().includes(serviceKeyword),
        ),
      );

      // Sort theo rating giảm dần, lấy top N
      const topMatched = matched
        .sort((a, b) => (b.shop.ratingAvg ?? 0) - (a.shop.ratingAvg ?? 0))
        .slice(0, topN)
        .map(({ shop, services }) => ({
          shop,
          // Chỉ giữ dịch vụ match để hiển thị nổi bật
          services: services.filter((svc) =>
            svc.serviceName.toLowerCase().includes(serviceKeyword) ||
            (svc.description ?? '').toLowerCase().includes(serviceKeyword) ||
            svc.category.toLowerCase().includes(serviceKeyword),
          ),
        }));

      toolResult = { type: 'shop_list', shops: topMatched };
      toolResponseData = {
        serviceKeyword,
        count: topMatched.length,
        totalShopsChecked: allShops.length,
        shops: topMatched.map((s) => ({
          id: s.shop.id,
          name: s.shop.shopName,
          rating: s.shop.ratingAvg,
          city: s.shop.city,
          address: s.shop.address,
          matchedServices: s.services.map((sv) => ({
            id: sv.id,
            name: sv.serviceName,
            price: sv.price,
            category: sv.category,
          })),
        })),
      };
    } else if (name === 'search_shops') {
      const shops = await shopService.searchPublic({
        keyword: args.keyword as string | undefined,
        city: args.city as string | undefined,
        shopType: args.shopType as string | undefined,
      });

      const topShops = args.sortByRating
        ? [...shops].sort((a, b) => (b.ratingAvg ?? 0) - (a.ratingAvg ?? 0)).slice(0, 5)
        : shops.slice(0, 5);

      const shopsWithServices: ShopWithServices[] = await Promise.all(
        topShops.map(async (shop) => {
          const services = await shopService.getShopServices(shop.id).catch(() => []);
          return { shop, services };
        }),
      );

      toolResult = { type: 'shop_list', shops: shopsWithServices };
      toolResponseData = {
        count: shopsWithServices.length,
        shops: shopsWithServices.map((s) => ({
          id: s.shop.id,
          name: s.shop.shopName,
          rating: s.shop.ratingAvg,
          city: s.shop.city,
          address: s.shop.address,
          services: s.services.map((sv) => ({
            id: sv.id,
            name: sv.serviceName,
            price: sv.price,
            category: sv.category,
          })),
        })),
      };
    } else if (name === 'prepare_booking') {
      // ── Tự động tìm shop + service + pet rồi hiển thị booking picker ─────
      if (!context.userId) {
        toolResponseData = { error: 'User chưa đăng nhập, không thể đặt lịch' };
      } else {
        const shopNameQuery = (args.shopName as string | undefined)?.toLowerCase().trim() ?? '';
        const serviceKw = (args.serviceKeyword as string).toLowerCase().trim();
        const petNameQuery = (args.petName as string | undefined)?.toLowerCase().trim() ?? '';

        // 1. Tìm shop theo tên
        const allShops = await shopService.searchPublic({ keyword: args.shopName as string | undefined });
        const matchedShop = shopNameQuery
          ? allShops.find(s => s.shopName.toLowerCase().includes(shopNameQuery)) ?? allShops[0]
          : allShops[0];

        if (!matchedShop) {
          toolResponseData = { error: `Không tìm thấy shop "${args.shopName}"` };
        } else {
          // 2. Tìm dịch vụ match trong shop đó
          const services = await shopService.getShopServices(matchedShop.id);
          const matchedService = services.find(s =>
            s.serviceName.toLowerCase().includes(serviceKw) ||
            (s.description ?? '').toLowerCase().includes(serviceKw) ||
            s.category.toLowerCase().includes(serviceKw)
          );

          if (!matchedService) {
            toolResponseData = { error: `Shop "${matchedShop.shopName}" không có dịch vụ "${args.serviceKeyword}"` };
          } else {
            // 3. Tìm pet của user
            const pets = await petService.getByOwner(context.userId);
            const activePets = pets.filter(p => p.active);
            const matchedPet = petNameQuery
              ? activePets.find(p =>
                  p.name.toLowerCase().includes(petNameQuery) ||
                  p.species.toLowerCase().includes(petNameQuery)
                ) ?? activePets[0]
              : activePets[0];

            if (!matchedPet) {
              toolResponseData = { error: 'Không tìm thấy thú cưng. Vui lòng thêm thú cưng trong hồ sơ.' };
            } else {
              // 4. Trả về booking_picker để user chọn ngày giờ
              toolResult = {
                type: 'booking_picker',
                shopId: matchedShop.id,
                shopName: matchedShop.shopName,
                serviceId: matchedService.id,
                serviceName: matchedService.serviceName,
                servicePrice: matchedService.price,
                petId: matchedPet.id,
                petName: matchedPet.name,
              };
              toolResponseData = {
                ready: true,
                shopName: matchedShop.shopName,
                serviceName: matchedService.serviceName,
                servicePrice: matchedService.price,
                petName: matchedPet.name,
                message: 'Đã tìm thấy đầy đủ thông tin, hiển thị form chọn ngày giờ',
              };
            }
          }
        }
      }
    } else if (name === 'get_shop_detail') {
      const shop = await shopService.getPublicById(args.shopId as number);
      const services = await shopService.getShopServices(args.shopId as number);
      toolResult = { type: 'shop_detail', shop, services };
      toolResponseData = {
        shop: {
          id: shop.id,
          name: shop.shopName,
          rating: shop.ratingAvg,
          description: shop.description,
          address: shop.address,
          city: shop.city,
          phone: shop.phone,
          openTime: shop.openTime,
          closeTime: shop.closeTime,
        },
        services: services.map((s) => ({
          id: s.id,
          name: s.serviceName,
          price: s.price,
          category: s.category,
          description: s.description,
        })),
      };
    } else if (name === 'get_my_pets') {
      if (!context.userId) {
        toolResponseData = { error: 'User chưa đăng nhập' };
      } else {
        const pets = await petService.getByOwner(context.userId);
        const activePets = pets.filter((p) => p.active);

        const calcAge = (dob?: string) => dob
          ? `${Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000))} tuổi`
          : 'Không rõ';

        if (args.petId) {
          const pet = activePets.find((p) => p.id === (args.petId as number));
          if (!pet) {
            toolResponseData = { error: 'Không tìm thấy thú cưng' };
          } else {
            const detail: PetDetail = {
              id: pet.id, name: pet.name, species: pet.species, breed: pet.breed,
              gender: pet.gender, weight: pet.weight, age: calcAge(pet.dob),
              avatar: pet.avatar, healthNote: pet.healthNote, allergies: pet.allergies,
              sterilized: pet.sterilized, color: pet.color, dob: pet.dob,
              favoriteFood: pet.favoriteFood, hobbies: pet.hobbies, walkTime: pet.walkTime,
              vaccinations: pet.vaccinations?.map((v) => ({ name: v.name, date: v.date, status: v.status })),
              upcomingReminders: pet.reminders?.filter((r) => r.status === 'active')
                .map((r) => ({ title: r.title, date: r.date, type: r.type })),
            };
            toolResult = { type: 'pet_detail', pet: detail };
            toolResponseData = { pet: detail };
          }
        } else {
          const summaries: PetSummary[] = activePets.map((p) => ({
            id: p.id, name: p.name, species: p.species, breed: p.breed,
            gender: p.gender, weight: p.weight, age: calcAge(p.dob),
            avatar: p.avatar, healthNote: p.healthNote, allergies: p.allergies,
            sterilized: p.sterilized,
          }));
          toolResult = { type: 'pet_list', pets: summaries };
          toolResponseData = { count: summaries.length, pets: summaries };
        }
      }
    } else if (name === 'create_booking') {
      if (!context.userId) {
        toolResponseData = { error: 'User chưa đăng nhập, không thể đặt lịch' };
      } else {
        const shop = await shopService.getPublicById(args.shopId as number);
        const services = await shopService.getShopServices(args.shopId as number);
        const service = services.find((s) => s.id === (args.serviceId as number));
        const pets = await petService.getByOwner(context.userId);
        const pet = pets.find((p) => p.id === (args.petId as number));

        if (!service || !pet) {
          toolResponseData = { error: 'Không tìm thấy dịch vụ hoặc thú cưng' };
        } else if (!args.appointmentDatetime) {
          // Chưa có datetime → hiển thị booking picker để user chọn
          toolResult = {
            type: 'booking_picker',
            shopId: args.shopId as number,
            shopName: shop.shopName,
            serviceId: args.serviceId as number,
            serviceName: service.serviceName,
            servicePrice: service.price,
            petId: args.petId as number,
            petName: pet.name,
          };
          toolResponseData = { needDatetime: true, shopName: shop.shopName, serviceName: service.serviceName, petName: pet.name };
        } else {
          const booking = await bookingService.createCashBooking({
            shopId: args.shopId as number,
            serviceId: args.serviceId as number,
            petId: args.petId as number,
            appointmentDatetime: args.appointmentDatetime as string,
            note: args.note as string | undefined,
            paymentMethod: 'CASH',
          });
          toolResult = {
            type: 'booking_success',
            bookingId: booking.id,
            shopName: shop.shopName,
            serviceName: service.serviceName,
            datetime: args.appointmentDatetime as string,
          };
          toolResponseData = { success: true, bookingId: booking.id, shopName: shop.shopName, serviceName: service.serviceName, datetime: args.appointmentDatetime };
        }
      }
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Lỗi không xác định';
    console.error('[Chatbot] Tool execution failed:', msg);
    toolResult = { type: 'error', message: msg };
    toolResponseData = { error: msg };
  }

  // Gọi Gemini lần 2 với kết quả tool
  const historyWithTool: GeminiContent[] = [
    ...geminiHistory,
    { role: 'model', parts: [{ functionCall: { name, args } }] },
    { role: 'user', parts: [{ functionResponse: { name, response: toolResponseData } }] },
  ];

  let finalResponse: { text?: string; functionCall?: { name: string; args: Record<string, unknown> } };
  try {
    finalResponse = await callGemini(historyWithTool, TOOL_DEFINITIONS, systemWithContext);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[Chatbot] Gemini call 2 failed:', msg);
    // Vẫn trả về toolResult dù Gemini lần 2 lỗi
    return { text: 'Đã tìm thấy kết quả. Xem bên dưới.', toolResult };
  }

  return { text: finalResponse.text ?? 'Đã xử lý xong.', toolResult };
}

