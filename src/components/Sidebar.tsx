"use client"
import { useState } from "react"
import  Link  from "next/link";
// import { useNavigate } from "react-router-dom";

const Sidebar = ({ setSidebarOpen }: { setSidebarOpen: (open: boolean) => void }) => {

    // const navigate = useNavigate();

    const Menus = [
        { title: "Dashboard", src: "bx-home-smile", path: '/accounts/users-list' },
        { title: "RCM", src: "Payslips", path: '/accounts/users-list' },
        { title: "Billing", src: "Inbox", path: '/accounts/users-list' },
        { title: "Caregivers", src: "bx-heart-circle", path: '/accounts/users-list' },
        { title: "Clients", src: "bx-user", path: '/accounts/users-list' },
        { title: "Accounts", src: "bx-user-circle", path: '/accounts/users-list' },
        { title: "Calender", src: "CalendarToday", path: '/accounts/users-list' },
        { title: "EVV-tracking", src: "MobileScreenShare", path: '/accounts/users-list' },
        { title: "Timesheets", src: "bx-spreadsheet", path: '/accounts/users-list' },
        { title: "Chat", src: "ChatBubbleOutline", path: '/accounts/users-list' },
        { title: "Reports", src: "ReportGmailerrorred", path: '/accounts/users-list' },
        { title: "Advance", src: "bx-radar", path: '/accounts/users-list' }
    ];

    const [open, setOpen] = useState(true);
    const [activeIndex, setActiveIndex] = useState(0);

    const toggleSidebar = () => {
        setOpen(!open);
        setSidebarOpen(!open); // Notify the parent about the state change
      };

    return (
        <>
            <div className={`flex ${open ? "w-72" : "w-20"}`}>
                <div
                    className={` ${open ? "w-72" : "w-20"
                        } bg-white h-screen p-5 pt-8 relative duration-300`}
                >
                    <img
                        src="/assets/svg-icons/handle.svg"
                        className={`absolute cursor-pointer -right-3 top-9 w-7 border-dark-purple
                                    border-2 rounded-full ${!open && "rotate-180"}`}
                        onClick={toggleSidebar}
                    />
                    <div className="flex gap-x-4 items-center">
                        <img
                            src="/assets/svg-icons/Logo.svg"
                            className={`cursor-pointer duration-500 ${open && "rotate-[360deg]"
                                }`}
                        />
                    </div>
                    <ul className="pt-6">
                        <div className="mt-5">
                            {Menus.map((Menu, index) => (
                                <li
                                    key={index}
                                    onClick={() => setActiveIndex(index)}
                                    className={`mb-2 border-2 rounded-lg flex rounded-md p-2 cursor-pointer hover:bg-light-white text-sm items-center gap-x-4 
                                                    ${activeIndex === index
                                            ? "bg-[#4B0082] text-white" // Active styles
                                            : "bg-white text-[#32475C]" // Default styles
                                        }
                                                `}
                                >
                                    <Link href={Menu.path} className={`flex items-center gap-x-4 w-full h-full ${activeIndex === index
                                        ? "bg-[#4B0082] text-white" // Active styles
                                        : "bg-white text-[#32475C]" // Default styles
                                        }`}
                                    >
                                        <img src={`/assets/svg-icons/${Menu.src}.svg`} className={`${activeIndex === index ? "filter brightness-0 invert" : ""}`} />
                                        <span className={`${!open && "hidden"} origin-left duration-200`}>
                                            {Menu.title}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </div>
                    </ul>
                </div>
            </div>
        </>
    )
}

export default Sidebar;