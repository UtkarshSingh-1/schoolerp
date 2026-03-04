import React, { useState, useEffect } from 'react';
import { Clock, User, MapPin, Plus, Filter } from 'lucide-react';
import { classApi, timetableApi } from '../services/api';
import { useAuth } from '../context/AuthContext';

const Timetable = () => {
    const { user } = useAuth();
    const [fetchedSchedule, setFetchedSchedule] = useState([]);
    const [classes, setClasses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedClass, setSelectedClass] = useState('');

    const days = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
    const timeSlots = [
        { label: '08:00 AM - 09:00 AM', start: '08:00', end: '09:00' },
        { label: '09:00 AM - 10:00 AM', start: '09:00', end: '10:00' },
        { label: '10:00 AM - 11:00 AM', start: '10:00', end: '11:00' },
        { label: '11:00 AM - 11:30 AM (Break)', start: '11:00', end: '11:30', isBreak: true },
        { label: '11:30 AM - 12:30 PM', start: '11:30', end: '12:30' },
        { label: '12:30 PM - 01:30 PM', start: '12:30', end: '13:30' }
    ];

    const isTeacher = user?.role === 'TEACHER';

    useEffect(() => {
        const loadClasses = async () => {
            try {
                const res = await classApi.list();
                const rows = Array.isArray(res.data) ? res.data : [];
                setClasses(rows);
                if (rows.length && !selectedClass) setSelectedClass(rows[0].id);
            } catch {
                // ignore
            }
        };
        if (!isTeacher) loadClasses();
    }, [isTeacher, selectedClass]);

    useEffect(() => {
        const fetchTimetable = async () => {
            setLoading(true);
            try {
                const params = isTeacher ? { teacherId: user.id } : { classId: selectedClass };
                const res = await timetableApi.list(params);
                const normalized = (res.data || []).map((s) => ({
                    ...s,
                    dayOfWeek: s.dayOfWeek || s.day_of_week,
                    startTime: s.startTime || s.start_time,
                    endTime: s.endTime || s.end_time,
                    teacherName: s.teacherName || s.teacher_name,
                    roomNumber: s.roomNumber || s.room_number
                }));
                setFetchedSchedule(normalized);
            } catch (err) {
                console.error('Error fetching timetable:', err);
            } finally {
                setLoading(false);
            }
        };
        if (isTeacher || selectedClass) fetchTimetable();
    }, [user, isTeacher, selectedClass]);

    const handleAddSlot = async () => {
        if (!selectedClass) {
            alert('Please select a class before adding a timetable slot.');
            return;
        }

        const dayOfWeek = prompt('Enter Day (e.g. MONDAY):');
        const startTime = prompt('Enter Start Time (e.g. 08:00):');
        const endTime = prompt('Enter End Time (e.g. 09:00):');
        const subject = prompt('Enter Subject:');
        const teacherName = prompt('Enter Assigned Teacher Name:');
        const roomNumber = prompt('Enter Room Number:');

        if (dayOfWeek && startTime && endTime && subject) {
            try {
                await timetableApi.create({
                    classId: selectedClass,
                    dayOfWeek: dayOfWeek.toUpperCase(),
                    startTime: startTime.length === 5 ? `${startTime}:00` : startTime,
                    endTime: endTime.length === 5 ? `${endTime}:00` : endTime,
                    subject,
                    teacherName,
                    roomNumber
                });
                alert('Lecture slot added successfully!');
                // Re-fetch
                const params = isTeacher ? { teacherId: user.id } : { classId: selectedClass };
                const res = await timetableApi.list(params);
                const normalized = (res.data || []).map((s) => ({
                    ...s,
                    dayOfWeek: s.dayOfWeek || s.day_of_week,
                    startTime: s.startTime || s.start_time,
                    endTime: s.endTime || s.end_time,
                    teacherName: s.teacherName || s.teacher_name,
                    roomNumber: s.roomNumber || s.room_number
                }));
                setFetchedSchedule(normalized);
            } catch (err) {
                alert(err.response?.data?.message || 'Error creating timetable slot');
            }
        } else {
            alert('Day, start time, end time and subject are required.');
        }
    };

    // Helper to map DB rows to the grid
    const getSlot = (day, timeSlot) => {
        return fetchedSchedule.find(s =>
            s.dayOfWeek === day &&
            s.startTime.startsWith(timeSlot.start)
        );
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 text-premium">
                        {isTeacher ? 'My Teaching Schedule' : 'Class Weekly Timetable'}
                    </h1>
                    <p className="text-gray-500">
                        {isTeacher ? 'View your assigned lecture slots and classrooms.' : 'View your current class schedule and subject slots.'}
                    </p>
                </div>
                <div className="flex gap-3">
                    {!isTeacher && (
                        <select
                            value={selectedClass}
                            onChange={e => setSelectedClass(e.target.value)}
                            className="px-4 py-2 bg-white border border-gray-200 rounded-xl font-bold text-gray-600 outline-none"
                        >
                            {classes.map((c) => (
                                <option key={c.id} value={c.id}>{c.name} - {c.section}</option>
                            ))}
                        </select>
                    )}
                    {['SCHOOL_ADMIN', 'SUPER_ADMIN'].includes(user?.role) && (
                        <button
                            onClick={handleAddSlot}
                            className="px-4 py-2 bg-blue-600 text-white rounded-xl font-bold text-sm hover:bg-blue-700 flex items-center gap-2"
                        >
                            <Plus size={16} /> Add Slot
                        </button>
                    )}
                </div>
            </div>

            <div className="bg-white rounded-3xl shadow-huge border border-gray-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50 border-b border-gray-100">
                                <th className="px-6 py-5 text-gray-400 text-[10px] font-black uppercase tracking-widest text-left w-48">Time Slot</th>
                                {days.map(day => (
                                    <th key={day} className="px-6 py-5 text-gray-900 text-xs font-black uppercase tracking-widest text-center border-l border-gray-100/50">
                                        {day}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {timeSlots.map((timeSlot, idx) => (
                                <tr key={timeSlot.label} className={`hover:bg-gray-50/30 transition-colors ${timeSlot.isBreak ? 'bg-slate-50/50' : ''}`}>
                                    <td className="px-6 py-8">
                                        <div className="flex items-center gap-3 text-gray-500">
                                            <Clock size={16} className={timeSlot.isBreak ? 'text-amber-500' : 'text-blue-500'} />
                                            <span className={`text-xs font-bold ${timeSlot.isBreak ? 'italic' : ''}`}>{timeSlot.label}</span>
                                        </div>
                                    </td>
                                    {days.map(day => {
                                        const slot = getSlot(day, timeSlot);
                                        return (
                                            <td key={`${day}-${idx}`} className="px-3 py-3 border-l border-gray-100/50 align-top">
                                                {timeSlot.isBreak ? (
                                                    <div className="flex items-center justify-center h-full min-h-[80px]">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-300 transform -rotate-12">Break</span>
                                                    </div>
                                                ) : slot ? (
                                                    <div className="p-4 rounded-2xl h-full transition-all border-l-4 bg-blue-50/50 border-blue-500 hover:shadow-lg hover:bg-white cursor-pointer group">
                                                        <h4 className="text-sm font-black text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">{slot.subject || 'Lecture'}</h4>
                                                        <div className="space-y-1.5">
                                                            <div className="flex items-center gap-2 text-gray-400">
                                                                <User size={12} />
                                                                <span className="text-[10px] font-bold">{slot.teacherName || 'Assigned Staff'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-gray-400">
                                                                <MapPin size={12} />
                                                                <span className="text-[10px] font-bold">{slot.roomNumber || 'Room 101'}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="h-full min-h-[80px] flex items-center justify-center">
                                                        <div className="w-1 h-1 bg-gray-100 rounded-full"></div>
                                                    </div>
                                                )}
                                            </td>
                                        );
                                    })}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Timetable;
