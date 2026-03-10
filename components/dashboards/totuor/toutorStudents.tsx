"use client"
import React, { useState, useEffect } from 'react';
import { Search, UserCircle, ArrowLeft, Mail, School, GraduationCap, X, CheckCircle2 } from 'lucide-react';

interface Student {
    id: string;
    name: string;
    image: string | null;
    institution: string | null;
    major: string | null;
    bio: string | null;
}

interface TutorStudentsViewProps {
    onBack: () => void;
}

const TutorStudentsView: React.FC<TutorStudentsViewProps> = ({ onBack }) => {
    const [students, setStudents] = useState<Student[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);

    useEffect(() => {
        const fetchStudents = async () => {
            try {
                const res = await fetch('/api/connections?status=ACCEPTED');
                if (res.ok) {
                    const data = await res.json();
                    // Map connection data to student list
                    const studentList = data.connections.map((c: any) => c.student);
                    setStudents(studentList);
                }
            } catch (error) {
                console.error("Failed to fetch students:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchStudents();
    }, []);

    const filteredStudents = students.filter(s =>
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (s.major?.toLowerCase() || '').includes(searchQuery.toLowerCase())
    );

    return (
        <div className="p-6 md:p-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
                <div>
                    <button
                        onClick={onBack}
                        className="flex items-center text-slate-500 hover:text-indigo-600 font-bold text-sm mb-4 transition-colors group"
                    >
                        <ArrowLeft size={18} className="mr-1 group-hover:-translate-x-1 transition-transform" />
                        Back to Dashboard
                    </button>
                    <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">My Students</h1>
                    <p className="text-slate-500 mt-1">Manage and view profiles of all your registered students.</p>
                </div>

                <div className="relative w-full md:w-80">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium text-slate-700"
                    />
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center p-20">
                    <span className="animate-spin h-8 w-8 border-4 border-indigo-600 border-t-transparent rounded-full"></span>
                </div>
            ) : filteredStudents.length === 0 ? (
                <div className="bg-white border border-dashed border-slate-200 rounded-[40px] p-20 text-center">
                    <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                        <UserCircle size={40} className="text-slate-300" />
                    </div>
                    <h3 className="text-xl font-bold text-slate-900 mb-2">No students found</h3>
                    <p className="text-slate-500 max-w-xs mx-auto">
                        {searchQuery ? "Try adjusting your search query." : "When you accept student requests, they will appear here."}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {filteredStudents.map((student) => (
                        <div
                            key={student.id}
                            onClick={() => setSelectedStudent(student)}
                            className="bg-white border border-slate-100 p-6 rounded-[32px] shadow-sm hover:shadow-xl hover:shadow-slate-200/50 hover:border-indigo-200 hover:-translate-y-1 transition-all cursor-pointer group"
                        >
                            <div className="flex flex-col items-center text-center">
                                <div className="w-20 h-20 bg-slate-100 rounded-3xl overflow-hidden mb-4 border border-slate-200 group-hover:border-indigo-400 transition-colors shadow-inner">
                                    <img
                                        src={student.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(student.name)}&background=random`}
                                        alt={student.name}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                                <h3 className="font-bold text-slate-900 text-lg mb-1">{student.name}</h3>
                                <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-3 truncate w-full px-2">
                                    {student.major || 'No Major'}
                                </p>
                                <div className="flex items-center justify-center space-x-2 text-slate-400">
                                    <School size={14} />
                                    <span className="text-[10px] font-bold truncate max-w-[120px]">{student.institution || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Student Profile Modal (Reuse the logic from Dashboard) */}
            {selectedStudent && (
                <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md z-[200] flex items-center justify-center p-4">
                    <div className="bg-white w-full max-w-md rounded-[40px] overflow-hidden shadow-2xl relative animate-in zoom-in duration-300">
                        {/* Header */}
                        <div className="h-32 bg-gradient-to-r from-indigo-600 to-slate-900 relative">
                            <button
                                onClick={() => setSelectedStudent(null)}
                                className="absolute top-4 right-4 p-2 bg-white/20 hover:bg-white/30 rounded-full text-white backdrop-blur-md transition-colors"
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Avatar */}
                        <div className="flex justify-center -mt-16 relative z-10">
                            <div className="w-32 h-32 rounded-3xl overflow-hidden border-4 border-white shadow-xl bg-slate-100">
                                <img
                                    src={selectedStudent.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(selectedStudent.name)}&background=random`}
                                    alt={selectedStudent.name}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        </div>

                        <div className="p-8 text-center">
                            <h3 className="text-2xl font-black text-slate-900">{selectedStudent.name}</h3>
                            <p className="text-indigo-600 font-bold text-sm uppercase tracking-widest mt-1">Student</p>

                            <div className="grid grid-cols-2 gap-4 mt-6 text-left">
                                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <School size={12} className="text-slate-400" />
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Institution</p>
                                    </div>
                                    <p className="text-xs font-bold text-slate-800 truncate">{selectedStudent.institution || 'N/A'}</p>
                                </div>
                                <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                                    <div className="flex items-center space-x-2 mb-1">
                                        <GraduationCap size={12} className="text-slate-400" />
                                        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Major</p>
                                    </div>
                                    <p className="text-xs font-bold text-slate-800 truncate">{selectedStudent.major || 'N/A'}</p>
                                </div>
                            </div>

                            <div className="mt-6 text-left">
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mb-2 px-2">Bio / Background</p>
                                <div className="bg-slate-50 p-5 rounded-3xl border border-slate-100 max-h-40 overflow-y-auto">
                                    <p className="text-sm text-slate-600 leading-relaxed italic text-center">
                                        {selectedStudent.bio || "No bio provided by the student."}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-8">
                                <button
                                    onClick={() => setSelectedStudent(null)}
                                    className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg active:scale-95"
                                >
                                    Close Profile
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TutorStudentsView;
