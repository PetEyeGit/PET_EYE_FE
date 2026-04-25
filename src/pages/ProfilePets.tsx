import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { petService } from '../services/pet.service';
import { useAuth } from '../contexts/AuthContext';
import { Pet } from '../types';

export default function ProfilePets() {
    const { user } = useAuth();
    const [pets, setPets] = useState<Pet[]>([]);
    const [loading, setLoading] = useState(true);
    const [showAdd, setShowAdd] = useState(false);
    const [petName, setPetName] = useState('');
    const [species, setSpecies] = useState('Dog');
    const [breed, setBreed] = useState('');
    const [weight, setWeight] = useState(0);

    useEffect(() => {
        if (user?.id) {
            fetchPets();
        }
    }, [user]);

    const fetchPets = async () => {
        try {
            setLoading(true);
            const data = await petService.getByOwner(Number(user?.id));
            setPets(data);
        } catch (error) {
            console.error('Failed to fetch pets:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddPet = async () => {
        try {
            await petService.create({
                name: petName,
                species,
                breed,
                weight,
                dob: new Date().toISOString().split('T')[0], // Default DOB
                ownerId: Number(user?.id)
            });
            setShowAdd(false);
            setPetName('');
            setBreed('');
            setWeight(0);
            fetchPets();
        } catch (error) {
            console.error('Failed to add pet:', error);
        }
    };

    return (
        <main className="flex-1 flex flex-col gap-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">Thú cưng của tôi</h1>
                    <p className="text-slate-500 dark:text-slate-400 mt-1">Quản lý hồ sơ sức khỏe cho các bé cưng.</p>
                </div>
                <button
                    onClick={() => setShowAdd(!showAdd)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#1a2b4c] text-white font-bold rounded-xl hover:bg-[#243d6b] transition-colors shadow-lg text-sm"
                >
                    <span className="material-symbols-outlined text-base">add</span>
                    Thêm thú cưng
                </button>
            </div>

            {/* Add pet form */}
            {showAdd && (
                <div className="bg-white dark:bg-slate-900 rounded-xl border border-dashed border-[#1a2b4c]/40 p-6 shadow-sm">
                    <h2 className="font-bold text-slate-800 dark:text-slate-100 mb-4">Thêm thú cưng mới</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block uppercase tracking-wider">Tên bé cưng</label>
                            <input
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-[#1a2b4c]"
                                placeholder="vd: Bông"
                                value={petName}
                                onChange={e => setPetName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block uppercase tracking-wider">Loài</label>
                            <select
                                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none"
                                value={species}
                                onChange={e => setSpecies(e.target.value)}
                            >
                                <option>Chó</option>
                                <option>Mèo</option>
                                <option>Thỏ</option>
                                <option>Chim</option>
                                <option>Khác</option>
                            </select>
                        </div>
                         <div>
                             <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block uppercase tracking-wider">Giống</label>
                             <input
                                 className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-[#1a2b4c]"
                                 placeholder="vd: Poodle"
                                 value={breed}
                                 onChange={e => setBreed(e.target.value)}
                             />
                         </div>
                         <div>
                             <label className="text-xs font-bold text-slate-600 dark:text-slate-400 mb-1 block uppercase tracking-wider">Cân nặng (kg)</label>
                             <input
                                 type="number"
                                 className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-900 dark:text-slate-100 outline-none focus:ring-1 focus:ring-[#1a2b4c]"
                                 placeholder="vd: 5.5"
                                 value={weight}
                                 onChange={e => setWeight(Number(e.target.value))}
                             />
                         </div>
                    </div>
                    <div className="flex gap-3 mt-4">
                        <button
                            onClick={handleAddPet}
                            className="px-6 py-2.5 bg-[#1a2b4c] text-white font-bold rounded-xl text-sm hover:opacity-90 transition-opacity"
                        >
                            Lưu thú cưng
                        </button>
                        <button
                            onClick={() => setShowAdd(false)}
                            className="px-6 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                        >
                            Hủy
                        </button>
                    </div>
                </div>
            )}

            {/* Pet cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {!loading && pets.length === 0 && (
                    <div className="col-span-full py-20 text-center bg-white dark:bg-slate-900 rounded-2xl border-2 border-dashed border-slate-200 dark:border-slate-800">
                        <p className="text-slate-400">Bạn chưa có thú cưng nào. Hãy thêm bé đầu tiên!</p>
                    </div>
                )}
                {pets.map(pet => (
                    <div key={pet.id} className="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-slate-200 dark:border-slate-800 overflow-hidden">
                        <div className="flex gap-4 p-5 border-b border-slate-100 dark:border-slate-800">
                            <img
                                src={pet.species === 'Mèo' ? 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?q=80&w=2043&auto=format&fit=crop' : 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?q=80&w=2069&auto=format&fit=crop'}
                                alt={pet.name}
                                className="size-20 rounded-xl object-cover shrink-0"
                            />
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-2">
                                    <div>
                                        <h3 className="font-black text-slate-900 dark:text-slate-100 text-lg">{pet.name}</h3>
                                        <p className="text-slate-500 text-sm">{pet.breed} • {pet.species}</p>
                                    </div>
                                    <span className={`shrink-0 text-xs font-bold px-2.5 py-1 rounded-full ${pet.isActive ? 'bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400'}`}>
                                        {pet.isActive ? '✓ Đang khỏe' : '! Đang bệnh'}
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">{pet.weight} kg</span>
                                    <span className="text-xs bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 px-2 py-0.5 rounded-full">{pet.dob}</span>
                                </div>
                            </div>
                        </div>
                        <div className="px-5 pb-5 pt-5 flex gap-2">
                            <Link
                                to={`/clinic/1`}
                                className="flex-1 py-2 text-center bg-[#1a2b4c] text-white font-bold rounded-xl text-sm hover:opacity-90 transition-opacity"
                            >
                                Đặt lịch khám
                            </Link>

                            <Link
                                to={`/pet/${pet.id}`}
                                className="flex-1 py-2 border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 font-bold rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors text-center"
                            >
                                Hồ sơ sức khỏe
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </main>
    );
}
