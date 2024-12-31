"use client"
import {
    EllipsisOutlined,
    ExportOutlined,
    SearchOutlined,
  } from "@ant-design/icons";
  import {
    Layout,
    Input,
    Select,
    Button,
    Table,
    Checkbox,
    Menu,
    Dropdown,
    MenuProps
  } from "antd";
//   import profile from "./../assets/profile.png";
//   import profile2 from "./../assets/profile2.png";
//   import profile3 from "./../assets/profile3.png";
//   import profile4 from "./../assets/profile4.png";
  import { useState } from "react";
//   import Sidebar from "../components/Sidebar";
  
  const { Content } = Layout;
  // Define columns for the table
  const columns = (
    handleCheckboxChange: (index: number) => void,
    handleSelectAllChange: (checked: boolean) => void
  ) => [
    {
      title: (
        <div style={{ color: "#32475CDE" }}>
          {/* Apply color to title */}
          <Checkbox onChange={(e) => handleSelectAllChange(e.target.checked)} />
        </div>
      ),
      dataIndex: "checkbox",
      key: "checkbox",
      render: (_text: any, record: any, index: number) => (
        <Checkbox
          checked={record.checked}
          onChange={() => handleCheckboxChange(index)}
        />
      ),
    },
    {
      title: <div style={{ color: "#32475CDE" }}>USER</div>,
      dataIndex: "column1",
      key: "column1",
      render: (_text: any, record: any) => {
        return (
          <div className="flex items-center">
            <img
              src={'/assets/svg-icons/Avatar.svg'} // Your avatar image here
              alt="User Avatar"
              style={{ width: 40, height: 40, borderRadius: "50%" }}
              className="mr-4"
            />
            <div>
              <p className="font-bold">{record.column1}</p> {/* Name */}
              <p className="text-sm">{record.column2}</p> {/* Email */}
            </div>
          </div>
        );
      },
    },
    {
      title: <div style={{ color: "#32475CDE" }}>ROLE</div>,
      dataIndex: "role", // Use role field from data
      key: "role", // Use role field from data
      render: (role: string) => {
        return <div className="text-sm">{role}</div>; // Display role
      },
    },
    {
      title: <div style={{ color: "#32475CDE" }}>PLAN</div>,
      dataIndex: "plan", // Use plan field from data
      key: "plan", // Use plan field from data
      render: (plan: string) => {
        return <div className="text-sm">{plan}</div>; // Display plan
      },
    },
    {
      title: <div style={{ color: "#32475CDE" }}>BILLING</div>,
      dataIndex: "billing", // Use billing field from data
      key: "billing", // Use billing field from data
      render: (billing: string) => <div className="text-sm">{billing}</div>, // Display billing type
    },
    {
      title: <div style={{ color: "#32475CDE" }}>STATUS</div>,
      dataIndex: "column5", // Use the status field
      key: "status",
      render: (status: string) => <div className="text-sm">{status}</div>, // Display status
    },
    {
      title: <div style={{ color: "#32475CDE" }}>ACTION</div>,
      dataIndex: "column6",
      key: "column6",
      render: (_text: any, record: any) => {
        const menuItems: MenuProps["items"] = [
            {
              key: "1",
              label: (
                <div onClick={() => handleEdit(record.key)}>
                  Edit
                </div>
              ),
            },
            {
              key: "2",
              label: (
                <div onClick={() => handleDelete(record.key)}>
                  Delete
                </div>
              ),
            },
          ];
        return (
          <Dropdown menu={{items: menuItems}} trigger={["click"]}>
            <EllipsisOutlined style={{ fontSize: 16, cursor: "pointer" }} />
          </Dropdown>
        );
      },
    },
  ];
  const initialData = [
    {
      key: "1",
      column1: "John Doe",
      column2: "john@example.com",
      column5: "Pending",
      role: "Editor",
      plan: "Team",
      billing: "Manual",
      checked: false,
    },
    {
      key: "2",
      column1: "Jane Smith",
      column2: "jane@example.com",
      column5: "Active",
      role: "Author",
      plan: "Company",
      billing: "Auto",
      checked: false,
    },
    {
      key: "3",
      column1: "Alice Johnson",
      column2: "alice@example.com",
      column5: "Pending",
      role: "Subscriber",
      plan: "Enterprise",
      billing: "Manual",
      checked: false,
    },
    {
      key: "4",
      column1: "Bob Lee",
      column2: "bob@example.com",
      column5: "Active",
      role: "Editor",
      plan: "Team",
      billing: "Auto",
      checked: false,
    },
    {
      key: "5",
      column1: "Charlie Brown",
      column2: "charlie@example.com",
      column5: "Pending",
      role: "Author",
      plan: "Company",
      billing: "Manual",
      checked: false,
    },
    {
      key: "6",
      column1: "Daniel Wright",
      column2: "daniel@example.com",
      column5: "Active",
      role: "Editor",
      plan: "Enterprise",
      billing: "Auto",
      checked: false,
    },
    {
      key: "7",
      column1: "Emily White",
      column2: "emily@example.com",
      column5: "Pending",
      role: "Subscriber",
      plan: "Team",
      billing: "Manual",
      checked: false,
    },
    {
      key: "8",
      column1: "Frank Black",
      column2: "frank@example.com",
      column5: "Active",
      role: "Author",
      plan: "Company",
      billing: "Auto",
      checked: false,
    },
    {
      key: "9",
      column1: "Grace Green",
      column2: "grace@example.com",
      column5: "Pending",
      role: "Editor",
      plan: "Enterprise",
      billing: "Manual",
      checked: false,
    },
    {
      key: "10",
      column1: "Harry Blue",
      column2: "harry@example.com",
      column5: "Active",
      role: "Subscriber",
      plan: "Team",
      billing: "Auto",
      checked: false,
    },
    {
      key: "11",
      column1: "Ivy Pink",
      column2: "ivy@example.com",
      column5: "Pending",
      role: "Author",
      plan: "Company",
      billing: "Manual",
      checked: false,
    },
    {
      key: "12",
      column1: "Jack Gray",
      column2: "jack@example.com",
      column5: "Active",
      role: "Editor",
      plan: "Enterprise",
      billing: "Auto",
      checked: false,
    },
  ];
  
  const handleEdit = (key: string) => {
    console.log("Edit action for user with key:", key);
    // Implement your edit logic here
  };
  
  const handleDelete = (key: string) => {
    console.log("Delete action for user with key:", key);
    // Implement your delete logic here
  };
  
  function UsersList() {
    const [data, setData] = useState(initialData);
    const [selectedRole, setSelectedRole] = useState<string>("");
    const handleCheckboxChange = (index: number) => {
      const updatedData = [...data];
      updatedData[index].checked = !updatedData[index].checked;
      setData(updatedData);
    };
  
    const handleSelectAllChange = (checked: boolean) => {
      const updatedData = data.map((item) => ({
        ...item,
        checked,
      }));
      setData(updatedData);
    };
    const handleRoleChange = (value: string) => {
      setSelectedRole(value);
    };
  
    const filteredData = selectedRole
      ? data.filter((item) => item.role === selectedRole)
      : data;
  
    return (
      <Layout className="flex-row h-screen w-screen">
        {/* Sidebar */}
        {/* <Sidebar /> */}
        {/* <Sider
          width="15%"
          className="bg-[#FFFFFF]"
          style={{ height: "100vh", position: "fixed" }}
        /> */}
  
        {/* Content Area */}
        <Layout style={{}}>
          {/* Search Bar with Custom Image Icons at the End */}
          {/* <div style={{ paddingInline: "40px", paddingTop: "20px" }}>
            <Input
              placeholder="Search..."
              size="large"
              prefix={<SearchOutlined />}
              suffix={
                <div style={{ display: "flex", alignItems: "center" }}>
                  <img
                    src={vectorImage}
                    alt="Vector Icon"
                    style={{
                      width: 20,
                      height: 20,
                      cursor: "pointer",
                      marginLeft: "20px",
                    }}
                  />
                  <img
                    src={iconButtonImage}
                    alt="Icon Button"
                    style={{
                      width: 30,
                      height: 30,
                      cursor: "pointer",
                      marginLeft: "20px",
                    }}
                  />
                  <img
                    src={moonImage}
                    alt="Moon Icon"
                    style={{
                      width: 18,
                      height: 18,
                      cursor: "pointer",
                      marginLeft: "20px",
                    }}
                  />
                  <img
                    src={notificationImage}
                    alt="Notification Icon"
                    style={{
                      width: 20,
                      height: 20,
                      cursor: "pointer",
                      marginLeft: "20px",
                    }}
                  />
                  <img
                    src={avatarImage}
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
          </div> */}
  
          {/* 4 Divs Under Search Bar */}
          {/* 4 Divs Under Search Bar */}
          <div className="flex justify-center space-x-4 mt-8">
            <div className="w-[23%] bg-[#ffffff] text-[#32475CDE] p-4 space-y-2 pt-6 flex justify-between items-center relative shadow-[0px_10px_20px_0px_lightgray] rounded-[10px]">
              {/* Left side content */}
              <div>
                <p className="text-left font-bold text-[#32475C99] text-[18px]">
                  Session
                </p>
                <p className="text-left text-[16px]">
                  <span className="text-[#32475CDE] text-[22px]">21,459 </span>
                  <span className="text-[#71DD37]"> ( +29 )</span>
                </p>
                <p className="text-left text-[#32475C99] text-[18px]">
                  Total users
                </p>
              </div>
              <div className="w-8 h-8 absolute bg-[#666CFF1F] right-5 top-8 flex justify-center items-center">
                {/* <img
                  src={profile} // Use the imported moon.png image here
                  alt="Moon Icon"
                  className="w-4 h-4"
                /> */}
              </div>
            </div>
  
            <div className="w-[23%] bg-[#ffffff] text-[#32475CDE] p-4 space-y-2 pt-6 flex justify-between items-center relative shadow-[0px_10px_20px_0px_lightgray] rounded-[10px]">
              {/* Left side content */}
              <div>
                <p className="text-left font-bold text-[#32475C99] text-[18px]">
                  Paid Users
                </p>
                <p className="text-left text-[16px]">
                  <span className="text-[#32475CDE] text-[22px]">4,567 </span>
                  <span className="text-[#71DD37]"> ( +18 )</span>
                </p>
                <p className="text-left text-[#32475C99] text-[18px]">
                  Last week analytics
                </p>
              </div>
              <div className="w-8 h-8 absolute bg-[#FF4D491F] right-5 top-8 flex justify-center items-center">
                {/* <img
                  src={profile2} // Use the imported moon.png image here
                  alt="Moon Icon"
                  className="w-5 h-4"
                /> */}
              </div>
            </div>
  
            <div className="w-[23%] bg-[#ffffff] text-[#32475CDE] p-4 space-y-2 pt-6 flex justify-between items-center relative shadow-[0px_10px_20px_0px_lightgray] rounded-[10px]">
              {/* Left side content */}
              <div>
                <p className="text-left font-bold text-[#32475C99] text-[18px]">
                  Active Users
                </p>
                <p className="text-left text-[16px]">
                  <span className="text-[#32475CDE] text-[22px]">19.860 </span>
                  <span className="text-[#FF3E1D]"> ( -14 )</span>
                </p>
                <p className="text-left text-[#32475C99] text-[18px]">
                  Last week analytics
                </p>
              </div>
              <div className="w-8 h-8 absolute bg-[#72E1281F] right-5 top-8 flex justify-center items-center">
                {/* <img
                  src={profile3} // Use the imported moon.png image here
                  alt="Moon Icon"
                  className="w-4 h-4"
                /> */}
              </div>
            </div>
  
            <div className="w-[23%] bg-[#ffffff] text-[#32475CDE] p-4 space-y-2 pt-6 flex justify-between items-center relative shadow-[0px_10px_20px_0px_lightgray] rounded-[10px]">
              {/* Left side content */}
              <div>
                <p className="text-left font-bold text-[#32475C99] text-[18px]">
                  Pending Users
                </p>
                <p className="text-left text-[16px]">
                  <span className="text-[#32475CDE] text-[22px]">237 </span>
                  <span className="text-[#71DD37]"> ( +42 )</span>
                </p>
                <p className="text-left text-[#32475C99] text-[18px]">
                  Last week analytics
                </p>
              </div>
              <div className="w-8 h-8 absolute bg-[#FDB5281F] right-5 top-8 flex justify-center items-center">
                {/* <img
                  src={profile4} // Use the imported moon.png image here
                  alt="Moon Icon"
                  className="w-4 h-4"
                /> */}
              </div>
            </div>
          </div>
  
          {/* Main Content */}
          <Content className="bg-[#F5F5F9] h-screen">
            <div className="w-[95%] h-[95%] bg-[#ffffff] mt-8 mx-auto shadow-[0px_10px_20px_0px_lightgray] rounded-[10px] flex flex-col">
              {/* Search Filter Heading */}
              <div className="text-left text-[#32475CDE] p-8 font-bold text-[20px]">
                Search Filters
              </div>
  
              {/* Input Fields with Dropdowns */}
              <div className="flex px-8 space-x-4 mb-10">
                {/* First Input Field */}
                <div className="w-1/3">
                  <Select
                    style={{ width: "100%" }}
                    placeholder="Select Role"
                    size="large"
                    dropdownStyle={{ textAlign: "left" }}
                    onChange={handleRoleChange}
                    options={[
                      { value: "Editor", label: "Editor" },
                      { value: "Author", label: "Author" },
                      { value: "Subscriber", label: "Subscriber" },
                    ]}
                  />
                </div>
                <div className="w-1/3">
                  <Select
                    style={{ width: "100%" }}
                    placeholder="Invoice Date"
                    size="large" // Set to large for bigger input size
                    dropdownStyle={{ textAlign: "left" }}
                    options={[
                      { value: "Option1", label: "Option 1" },
                      { value: "Option2", label: "Option 2" },
                      { value: "Option3", label: "Option 3" },
                    ]}
                  />
                </div>
                {/* Third Input Field with Dropdown */}
                <div className="w-1/3">
                  <Select
                    style={{ width: "100%" }}
                    placeholder="Invoice Status"
                    size="large" // Set to large for bigger input size
                    dropdownStyle={{ textAlign: "left" }}
                    options={[
                      { value: "Option1", label: "Option 1" },
                      { value: "Option2", label: "Option 2" },
                      { value: "Option3", label: "Option 3" },
                    ]}
                  />
                </div>
              </div>
              <hr></hr>
              <div className="flex justify-between items-center px-8 py-4">
                {/* Button on the left */}
                <Button
                  style={{ width: "120px", color: "#8592A3", height: "40px" }} // Set text color
                  icon={<ExportOutlined style={{ color: "#8592A3" }} />} // Set icon color
                >
                  Export
                </Button>
  
                {/* Buttons on the right */}
                <div className="flex space-x-4">
                  {/* Wider input field */}
                  <div className="w-3/4">
                    <Input
                      placeholder="Select User"
                      size="large"
                      style={{ width: "100%" }}
                    />
                  </div>
  
                  {/* Add User Button */}
                  <Button
                    style={{
                      backgroundColor: "#4B0082",
                      width: "120px",
                      height: "40px",
                    }}
                    className="text-white"
                  >
                    ADD USER
                  </Button>
                </div>
              </div>
              <div className="px-8 py-4">
                <Table
                  columns={columns(handleCheckboxChange, handleSelectAllChange)}
                  dataSource={filteredData}
                  rowKey="key"
                  pagination={{ pageSize: 5 }}
                />
              </div>
            </div>
          </Content>
        </Layout>
      </Layout>
    );
  }
  
  export default UsersList;
  