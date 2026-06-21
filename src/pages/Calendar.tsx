import React, { useState, useMemo } from 'react';
import { Calendar as CalendarIcon, Clock, Users, Video, ChevronLeft, ChevronRight, Plus, X } from 'lucide-react';

// ... (keep SCHEDULE_DATA)
const SCHEDULE_DATA: Record<string, any[]> = {
  Today: [
    { time: '09:00 AM', title: 'UX Research Sync', type: 'Design', duration: '45m', color: 'bg-card-pink' },
    { time: '11:30 AM', title: 'Advanced React Patterns', type: 'Course', duration: '2h', color: 'bg-[#DCDDFF]' },
    { time: '02:00 PM', title: '1-on-1 Mentoring', type: 'Call', duration: '30m', color: 'bg-card-yellow' },
    { time: '04:00 PM', title: 'System Design Q&A', type: 'Webinar', duration: '1h', color: 'bg-[#B2F0D1]' },
  ],
  Week: [
    { day: 'Mon', time: '10:00 AM', title: 'Weekly Sync', type: 'Meeting', duration: '30m', color: 'bg-[#DCDDFF]' },
    { day: 'Tue', time: '01:00 PM', title: 'Flutter Basics', type: 'Course', duration: '3h', color: 'bg-card-pink' },
    { day: 'Wed', time: '09:00 AM', title: 'Design Review', type: 'Design', duration: '1h', color: 'bg-[#B2F0D1]' },
    { day: 'Thu', time: '03:00 PM', title: 'Networking 101', type: 'Webinar', duration: '45m', color: 'bg-card-yellow' },
    { day: 'Fri', time: '11:00 AM', title: 'Tech Talk', type: 'Call', duration: '1h', color: 'bg-[#DCDDFF]' },
  ]
};

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

function generateMockEvents(date: number | null) {
  if (!date) return [];
  const events = [];
  
  if (date % 3 === 0 || date === 24) {
    events.push({ time: '09:00 AM', duration: '45m', title: 'Morning Sync', color: 'bg-card-pink' });
  }
  if (date % 5 === 0 || date === 24) {
    events.push({ time: '01:00 PM', duration: '1h 30m', title: 'Deep Work Session', color: 'bg-card-yellow' });
  }
  if (date % 7 === 0 || date === 24) {
    events.push({ time: '04:30 PM', duration: '1h', title: 'Project Review', color: 'bg-card-green' });
  }
  if (events.length === 0) {
    events.push({ time: '10:00 AM', duration: '30m', title: 'Quick Catch Up', color: 'bg-[#DCDDFF]' });
  }
  return events;
}

function NewEventModal({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
  if (!isOpen) return null;
  return (
    <div 
      onClick={onClose}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-[#1B1B1B]/40 backdrop-blur-sm px-4 cursor-pointer"
    >
      <div 
        onClick={(e) => e.stopPropagation()}
        className="bg-white rounded-[2rem] w-full max-w-[420px] p-6 shadow-2xl relative cursor-default"
      >
        <button 
          onClick={onClose} 
          className="absolute right-5 top-5 w-7 h-7 bg-red-500 hover:bg-red-650 text-white rounded-full flex items-center justify-center transition-colors cursor-pointer shadow-sm"
          title="Close"
        >
          <X className="w-3.5 h-3.5" strokeWidth={3} />
        </button>
        <h2 className="text-xl font-bold text-[#1B1B1B] mb-5">New Event</h2>
        
        <div className="flex flex-col gap-6">
           <div>
              <label className="text-[13px] font-bold text-[#848484] uppercase tracking-wider mb-2 block">Event Title</label>
              <input type="text" placeholder="e.g. Portfolio Review" className="w-full bg-[#f4f4f4] border border-transparent rounded-[20px] px-5 py-4 text-[16px] font-medium text-[#1B1B1B] focus:border-black/10 focus:bg-white focus:outline-none focus:ring-4 focus:ring-black/5 outline-none transition-all" />
           </div>
           
           <div className="flex gap-4">
              <div className="flex-1">
                 <label className="text-[13px] font-bold text-[#848484] uppercase tracking-wider mb-2 block">Date</label>
                 <input type="date" className="w-full bg-[#f4f4f4] border border-transparent rounded-[20px] px-5 py-4 text-[16px] font-medium text-[#1B1B1B] focus:border-black/10 focus:bg-white focus:outline-none focus:ring-4 focus:ring-black/5 transition-all" />
              </div>
              <div className="flex-1">
                 <label className="text-[13px] font-bold text-[#848484] uppercase tracking-wider mb-2 block">Time</label>
                 <input type="time" className="w-full bg-[#f4f4f4] border border-transparent rounded-[20px] px-5 py-4 text-[16px] font-medium text-[#1B1B1B] focus:border-black/10 focus:bg-white focus:outline-none focus:ring-4 focus:ring-black/5 transition-all" />
              </div>
           </div>

           <div className="flex gap-4 mb-2">
              <div className="flex-1">
                 <label className="text-[13px] font-bold text-[#848484] uppercase tracking-wider mb-2 block">Event Type</label>
                 <select className="w-full bg-[#f4f4f4] border border-transparent rounded-[20px] px-5 py-4 text-[16px] font-medium text-[#1B1B1B] focus:border-black/10 focus:bg-white focus:outline-none focus:ring-4 focus:ring-black/5 transition-all appearance-none cursor-pointer">
                    <option>Design Sync</option>
                    <option>Mentorship</option>
                    <option>Webinar</option>
                    <option>Live Course</option>
                 </select>
              </div>
           </div>
           
           <button onClick={onClose} className="w-full bg-[#1B1B1B] text-white py-4 rounded-[20px] text-[16px] font-bold mt-2 hover:bg-[#1B1B1B]/90 transition-colors hover:shadow-lg hover:-translate-y-0.5">
              Schedule Event
           </button>
        </div>
      </div>
    </div>
  );
}

export default function Calendar() {
  const [view, setView] = useState<'Today' | 'Week' | 'Month'>('Today');
  const [currentMonthIndex, setCurrentMonthIndex] = useState(9); // Oct
  const [selectedDate, setSelectedDate] = useState<number | null>(24);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const prevAction = () => {
     if (view === 'Month') setCurrentMonthIndex(prev => (prev === 0 ? 11 : prev - 1));
     else if (view === 'Today') setSelectedDate(prev => prev && prev > 1 ? prev - 1 : 31);
     else if (view === 'Week') setSelectedDate(prev => prev && prev > 7 ? prev - 7 : 31);
  };
  const nextAction = () => {
     if (view === 'Month') setCurrentMonthIndex(prev => (prev === 11 ? 0 : prev + 1));
     else if (view === 'Today') setSelectedDate(prev => prev && prev < 31 ? prev + 1 : 1);
     else if (view === 'Week') setSelectedDate(prev => prev && prev < 24 ? prev + 7 : 1);
  };

  const getSubHeader = () => {
    if (view === 'Today') return `${MONTHS[currentMonthIndex]} ${selectedDate}, 2023`;
    if (view === 'Week') {
      const end = (selectedDate || 1) + 6 > 31 ? ((selectedDate || 1) + 6) % 31 : (selectedDate || 1) + 6;
      return `${MONTHS[currentMonthIndex].substring(0, 3)} ${selectedDate} - ${MONTHS[currentMonthIndex].substring(0, 3)} ${end}, 2023`;
    }
    return `31 Days, 12 Events`;
  };

  const getHeader = () => {
    if (view === 'Today') return "Today's Agenda";
    if (view === 'Week') return "This Week";
    return `${MONTHS[currentMonthIndex]} 2023`;
  };

  return (
    <>
      <NewEventModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
      <main className="flex-1 flex flex-col pt-10 xl:pt-[54px] px-6 md:px-[60px] xl:px-16 w-full min-w-0 pb-10">
        <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-6 mb-[50px]">
          <h1 className="text-[52px] md:text-[68px] xl:text-[76px] font-semibold tracking-tight leading-[1] max-w-[500px] text-[#1B1B1B]">
            Schedule
          </h1>
          <div className="flex flex-col md:flex-row items-center gap-4">
             <button onClick={() => setIsModalOpen(true)} className="bg-[#1B1B1B] w-full md:w-auto text-white px-6 py-3 rounded-full text-[15px] font-semibold shadow-sm hover:scale-105 transition-transform flex items-center justify-center gap-2">
               <Plus size={18} /> New Event
             </button>
           <div className="flex bg-white rounded-full p-1.5 shadow-sm border border-black/5 w-full md:w-auto overflow-x-auto scrollbar-hide">
             <button 
               onClick={() => setView('Today')} 
               className={`px-8 py-2.5 rounded-full text-[14px] font-semibold transition-colors ${view === 'Today' ? 'bg-[#E8E1F5] text-[#1B1B1B]' : 'text-[#848484] hover:text-[#1B1B1B]'}`}
             >
               Today
             </button>
             <button 
               onClick={() => setView('Week')} 
               className={`px-8 py-2.5 rounded-full text-[14px] font-semibold transition-colors ${view === 'Week' ? 'bg-[#E8E1F5] text-[#1B1B1B]' : 'text-[#848484] hover:text-[#1B1B1B]'}`}
             >
               Week
             </button>
             <button 
               onClick={() => setView('Month')} 
               className={`px-8 py-2.5 rounded-full text-[14px] font-semibold transition-colors ${view === 'Month' ? 'bg-[#E8E1F5] text-[#1B1B1B]' : 'text-[#848484] hover:text-[#1B1B1B]'}`}
             >
               Month
             </button>
           </div>
        </div>
      </div>

      <div className="flex flex-col xl:flex-row gap-8 items-start">
        <div className="bg-white rounded-[40px] px-6 md:px-10 py-10 shadow-sm border border-black/5 min-h-[600px] flex-1 w-full overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-12 gap-6">
            <div className="flex items-center gap-5">
              <div className="w-[64px] h-[64px] bg-[#E8E1F5] rounded-[22px] flex items-center justify-center text-[#1B1B1B] shrink-0">
                <CalendarIcon size={26} strokeWidth={2} />
              </div>
              <div className="min-w-0">
                <h2 className="text-[26px] font-semibold text-[#1B1B1B] truncate">
                  {getHeader()}
                </h2>
                <p className="text-[#848484] font-medium text-[16px] truncate">
                  {getSubHeader()}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 shrink-0">
               <button onClick={prevAction} className="w-12 h-12 rounded-full border-2 border-black/5 flex items-center justify-center hover:bg-black/5 text-[#1B1B1B] transition-colors">
                  <ChevronLeft size={22} />
               </button>
               <button onClick={nextAction} className="w-12 h-12 rounded-full border-2 border-black/5 flex items-center justify-center hover:bg-black/5 text-[#1B1B1B] transition-colors">
                  <ChevronRight size={22} />
               </button>
            </div>
          </div>

          {view === 'Month' ? (
            <MonthGrid selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
          ) : (
            <div className="flex flex-col gap-10">
              {(SCHEDULE_DATA[view] || []).map((session, i) => (
                <div key={i} className="flex relative z-10 items-stretch group">
                  {/* Left Column Text */}
                  <div className="flex flex-col items-start md:items-end w-[80px] shrink-0 pt-0 md:pt-[34px]">
                    {session.day && <div className="text-[16px] font-bold text-[#1B1B1B] mb-1 mr-0 md:mr-4">{session.day}</div>}
                    <div className="mr-0 md:mr-4 pr-2 md:pr-0">
                        <span className="text-[15px] font-bold text-[#848484] tracking-tight">{session.time.split(' ')[0]}</span>
                        <span className="text-[12px] font-semibold text-[#848484] ml-1">{session.time.split(' ')[1]}</span>
                    </div>
                  </div>
                  
                  {/* Timeline Divider and Dot */}
                  <div className="flex flex-col items-center w-[40px] shrink-0 relative">
                     <div className="absolute top-0 bottom-[-40px] w-[2px] bg-black/5 z-0"></div>
                     <div className={`w-[14px] h-[14px] rounded-full ${session.color.replace('bg-', 'bg-')} shadow-[0_0_0_6px_white] relative z-10 md:mt-[38px] mt-1 shrink-0`}></div>
                  </div>

                  {/* Card Content */}
                  <div className={`flex-1 w-full ${session.color} rounded-[32px] p-6 md:p-8 flex flex-col xl:flex-row xl:items-center justify-between gap-6 hover:shadow-md transition-shadow cursor-pointer min-w-0 border-2 border-transparent hover:border-black/5 ml-4 md:ml-0`}>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="bg-white/80 px-4 py-1.5 rounded-[12px] text-[13px] font-bold text-[#1B1B1B] shadow-sm whitespace-nowrap">
                          {session.type}
                        </span>
                        <span className="flex items-center gap-1.5 text-[14px] font-semibold text-[#1B1B1B] opacity-80 whitespace-nowrap">
                          <Clock size={16} /> {session.duration}
                        </span>
                      </div>
                      <h3 className="text-[22px] md:text-[24px] font-semibold text-[#1B1B1B] leading-tight break-words">{session.title}</h3>
                    </div>
                    
                    <div className="flex items-center justify-between xl:justify-end gap-6 w-full xl:w-auto shrink-0 mt-4 xl:mt-0">
                      <div className="flex -space-x-[14px]">
                        <img src={`https://randomuser.me/api/portraits/women/${10 + i}.jpg`} className="w-[42px] h-[42px] rounded-full border-[3px] border-white object-cover" />
                        <img src={`https://randomuser.me/api/portraits/men/${30 + i}.jpg`} className="w-[42px] h-[42px] rounded-full border-[3px] border-white object-cover" />
                      </div>
                      <button className="w-14 h-14 bg-white rounded-full flex items-center justify-center text-[#1B1B1B] hover:scale-105 transition-transform shadow-md">
                        <Video size={20} strokeWidth={2.5} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {view === 'Month' && selectedDate && (
           <div className="w-full xl:w-[360px] bg-white rounded-[40px] shadow-sm border border-black/5 flex-shrink-0 flex flex-col overflow-hidden">
              <div className="bg-[#1B1B1B] p-8 pb-10 text-white relative z-10">
                 <div className="absolute top-0 right-0 w-[50%] h-full bg-gradient-to-l from-white/10 to-transparent pointer-events-none skew-x-12 translate-x-10"></div>
                 <h2 className="text-[32px] font-semibold leading-[1.1] mb-2">{MONTHS[currentMonthIndex]} {selectedDate}</h2>
                 <p className="text-white/60 font-medium">{generateMockEvents(selectedDate).length} Scheduled Events</p>
              </div>
              <div className="p-6 flex flex-col gap-4 bg-white rounded-t-[24px]">
                 {generateMockEvents(selectedDate).map((session, i) => (
                    <div key={i} className={`p-5 rounded-[20px] ${session.color} border border-transparent shadow-sm relative overflow-hidden group hover:shadow-md cursor-pointer transition-shadow`}>
                       <div className="flex items-center gap-2 mb-2">
                          <span className="text-[12px] font-bold text-[#1B1B1B] bg-white/60 px-2 py-1 rounded-md">{session.time}</span>
                          <span className="text-[12px] font-medium text-[#1B1B1B]/70">{session.duration}</span>
                       </div>
                       <h4 className="text-[16px] font-semibold text-[#1B1B1B] max-w-[80%]">{session.title}</h4>
                    </div>
                 ))}
                 <button className="w-full py-4 mt-2 rounded-[20px] border-2 border-dashed border-black/10 text-[#848484] font-semibold hover:border-[#1B1B1B] hover:text-[#1B1B1B] transition-colors flex items-center justify-center gap-2">
                   <Plus size={18} /> Schedule Call
                 </button>
              </div>
           </div>
        )}
      </div>
    </main>
    </>
  );
}

function MonthGrid({ selectedDate, setSelectedDate }: { selectedDate: number | null, setSelectedDate: (d: number) => void }) {
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const dates = Array.from({ length: 31 }, (_, i) => i + 1);
  const offset = 2; // Starts on Tuesday

  return (
    <div className="w-full">
      <div className="grid grid-cols-7 gap-2 md:gap-4 mb-4">
        {days.map(d => (
          <div key={d} className="text-center text-[13px] font-bold text-[#848484] uppercase tracking-wider">
            {d}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-7 gap-y-2 gap-x-2 md:gap-y-4 md:gap-x-4">
        {Array.from({ length: offset }).map((_, i) => (
          <div key={`empty-${i}`} className="h-[80px] md:h-[100px] rounded-[16px] bg-transparent"></div>
        ))}
        {dates.map((date) => {
          const isSelected = selectedDate === date;
          const isToday = date === 24;
          const hasEvent1 = date % 3 === 0 || date === 24;
          const hasEvent2 = date % 5 === 0 || date === 24;
          
          return (
            <div 
              key={date} 
              onClick={() => setSelectedDate(date)}
              className={`h-[80px] md:h-[100px] rounded-[16px] md:rounded-[20px] p-2 flex flex-col items-center justify-start transition-all cursor-pointer border-[2px] ${
                isSelected ? 'bg-[#1B1B1B] text-white border-[#1B1B1B] shadow-md scale-105 z-10 relative' : 
                isToday ? 'bg-[#E8E1F5] border-transparent text-[#1B1B1B] hover:border-black/20' : 
                'bg-bg-base/30 border-black/5 text-[#1B1B1B] hover:bg-white hover:border-black/20 hover:shadow-sm'
              }`}
            >
              <span className={`text-[16px] font-semibold mt-1 md:mt-2 ${isSelected ? 'text-white' : 'text-[#1B1B1B]'}`}>{date}</span>
              <div className="flex gap-1 md:gap-1.5 mt-auto mb-1 md:mb-2 flex-wrap justify-center px-1">
                {hasEvent1 && <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-card-pink' : 'bg-card-pink'}`}></div>}
                {hasEvent2 && <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-card-yellow' : 'bg-card-yellow'}`}></div>}
                {date % 7 === 0 && <div className={`w-2 h-2 rounded-full ${isSelected ? 'bg-card-green' : 'bg-card-green'}`}></div>}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
