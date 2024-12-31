"use client";
import { Input } from "antd"
import {SearchOutlined} from "@ant-design/icons";
import Image from 'next/image';
import { useState } from "react";

const Header = ({ sidebarOpen }: { sidebarOpen: boolean }) => {

    const [open, setOpen] = useState(true);

    return(
    <div style={{
        position: "fixed",
        top: 22,
        left: sidebarOpen ? "310px" : "100px", // Adjust this value to match your Sidebar's width
        right: "20px",
        height: "60px", // Set a fixed height for the Header
        backgroundColor: "#f8f9fa", // Add a background color
        display: "flex",
        alignItems: "center",
        padding: "0 0px",
        zIndex: 1000,
        // boxShadow: "2px 2px 2px rgba(0,0,0,0.1)", // Optional shadow for aesthetics
      }}
>
          <Input
            placeholder="Search..."
            size="large"
            prefix={<SearchOutlined />}
            suffix={
              <div style={{ display: "flex", alignItems: "center" }}>
                <img
                  src={'/assets/svg-icons/translate.svg'}
                  alt="Vector Icon"
                  style={{
                    width: 20,
                    height: 20,
                    cursor: "pointer",
                    marginLeft: "20px",
                  }}
                />
                <img
                  src={'/assets/svg-icons/bx-grid-alt.svg'}
                  alt="Icon Button"
                  style={{
                    width: 30,
                    height: 30,
                    cursor: "pointer",
                    marginLeft: "20px",
                  }}
                />
                <img
                  src={'/assets/svg-icons/bx-moon.svg'}
                  alt="Moon Icon"
                  style={{
                    width: 18,
                    height: 18,
                    cursor: "pointer",
                    marginLeft: "20px",
                  }}
                />
                <img
                  src={'/assets/svg-icons/bx-notification.svg'}
                  alt="Notification Icon"
                  style={{
                    width: 20,
                    height: 20,
                    cursor: "pointer",
                    marginLeft: "20px",
                  }}
                />
                <img
                  src={'/assets/svg-icons/Avatar.svg'}
                  alt="Avatar Icon"
                  style={{
                    width: 40,
                    height: 40,
                    cursor: "pointer",
                    marginLeft: "20px",
                  }}
                />
              </div>
            }
            onPressEnter={(e: any) => console.log(e.target.value)}
          />
        </div>
    )
}

export default Header
