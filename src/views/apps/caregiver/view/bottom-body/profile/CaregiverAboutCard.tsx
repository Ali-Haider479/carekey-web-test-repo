import React from 'react'
import { EditOutlined, PlusOutlined } from '@ant-design/icons'

function CaregiverAboutCard() {
  return (
    <div>
      <div className='w-full ml-2 bg-white shadow-md rounded-lg p-6'>
        {/* About Header */}
        <div className='flex justify-between items-center mb-6'>
          <h2 className='text-2xl font-semibold text-gray-700'>About</h2>
          {/* <Button
            label="Edit"
            icon={<EditOutlined />}
            className={"bg-[#4B0082] text-white"}
            onClick={undefined}
          /> */}
        </div>

        {/* Personal Details Section */}
        <div className='mb-6'>
          <h3 className='text-lg font-semibold text-gray-600 mb-4'>Personal Details</h3>
          <div className='grid grid-cols-2 gap-y-4 gap-x-8'>
            <div className='flex justify-between text-sm text-gray-500'>
              <span>First Name:</span>
              <span className='text-gray-900'>Sameer</span>
            </div>
            <div className='flex justify-between text-sm text-gray-500'>
              <span>User Name:</span>
              <span className='text-gray-900'>094382632</span>
            </div>
            <div className='flex justify-between text-sm text-gray-500'>
              <span>Middle Name:</span>
              <span className='text-gray-900'>K</span>
            </div>
            <div className='flex justify-between text-sm text-gray-500'>
              <span>Title:</span>
              <span className='text-gray-900'>2714</span>
            </div>
            <div className='flex justify-between text-sm text-gray-500'>
              <span>Last Name:</span>
              <span className='text-gray-900'>Khan</span>
            </div>
            <div className='flex justify-between text-sm text-gray-500'>
              <span>Phone Number:</span>
              <span className='text-gray-900'>+123-412-4214-4</span>
            </div>
            <div className='flex justify-between text-sm text-gray-500'>
              <span>Date of Birth:</span>
              <span className='text-gray-900'>05/05/2000</span>
            </div>
            <div className='flex justify-between text-sm text-gray-500'>
              <span>Email Address:</span>
              <span className='text-gray-900'>sameer@gmail.com</span>
            </div>
            <div className='flex justify-between text-sm text-gray-500'>
              <span>Cell Phone Number:</span>
              <span className='text-gray-900'>+238146</span>
            </div>
          </div>
        </div>

        {/* Emergency Details Section */}
        <div className=' mb-6 border-t pt-6'>
          <div className='grid grid-cols-2 gap-y-4 gap-x-8'>
            <div className='flex justify-between text-sm text-gray-500'>
              <span>EMERGENCY NUMBER:</span>
              <span className='text-gray-900'>---</span>
            </div>
            <div className='flex justify-between text-sm text-gray-500'>
              <span>EMERGENCY C.NUMBER:</span>
              <span className='text-gray-900'>---</span>
            </div>
          </div>
          <div className='mt-6 border-t pt-6'>
            <div className='grid grid-cols-2 gap-y-4 gap-x-8'>
              <div className='flex justify-between text-sm text-gray-500'>
                <span>Emergency Email ID:</span>
                <span className='text-gray-900'>sameerkhan@gmail</span>
              </div>
              <div className='flex justify-between text-sm text-gray-500'>
                <span>Employee Number:</span>
                <span className='text-gray-900'>---</span>
              </div>
              <div className='flex justify-between text-sm text-gray-500'>
                <span>Address:</span>
                <span className='text-gray-900'>5th Street</span>
              </div>
              <div className='flex justify-between text-sm text-gray-500'>
                <span>City:</span>
                <span className='text-gray-900'>CALIFORNIA</span>
              </div>
              <div className='flex justify-between text-sm text-gray-500'>
                <span>State:</span>
                <span className='text-gray-900'>United States</span>
              </div>
              <div className='flex justify-between text-sm text-gray-500'>
                <span>Zip:</span>
                <span className='text-gray-900'>124512</span>
              </div>
              <div className='flex justify-between text-sm text-gray-500'>
                <span>Date of Hire:</span>
                <span className='text-gray-900'>---</span>
              </div>
              <div className='flex justify-between text-sm text-gray-500'>
                <span>Caregiver Level:</span>
                <span className='text-gray-900'>---</span>
              </div>
              <div className='flex justify-between text-sm text-gray-500'>
                <span>NPI/UMPI Number:</span>
                <span className='text-gray-900'>---</span>
              </div>
              <div className='flex justify-between text-sm text-gray-500'>
                <span>Training Completed:</span>
                <span className='text-gray-900'>Aug 22,2022</span>
              </div>
              <div className='flex justify-between text-sm text-gray-500'>
                <span>Is 245D licensed:</span>
                <span className='text-gray-900'>Yes</span>
              </div>
              <div className='flex justify-between text-sm text-gray-500'>
                <span>DL Expiration Date:</span>
                <span className='text-gray-900'>---</span>
              </div>
              <div className='flex justify-between text-sm text-gray-500'>
                <span>Driver Liscensed:</span>
                <span className='text-gray-900'>---</span>
              </div>
              <div className='flex justify-between text-sm text-gray-500'>
                <span>Addional Pay Rate:</span>
                <span className='text-gray-900'>---</span>
              </div>
            </div>
          </div>
        </div>

        {/* Additional Details Section */}
        <div className='mb-6 border-t pt-6'>
          <div className='grid grid-cols-2 gap-y-4 gap-x-8'>
            <div className='flex justify-between text-sm text-gray-500'>
              <span>Case Manager Name:</span>
              <span className='text-gray-900'>---</span>
            </div>
            <div className='flex justify-between text-sm text-gray-500'>
              <span>Case Manager's Extension:</span>
              <span className='text-gray-900'>---</span>
            </div>
            <div className='flex justify-between text-sm text-gray-500'>
              <span>Case Manager's Phone Number:</span>
              <span className='text-gray-900'>---</span>
            </div>
            <div className='flex justify-between text-sm text-gray-500'>
              <span>Case Manager's Email Details:</span>
              <span className='text-gray-900'>---</span>
            </div>
            <div className='flex justify-between text-sm text-gray-500'>
              <span>Case Manager's FAX Number:</span>
              <span className='text-gray-900'>---</span>
            </div>
          </div>
        </div>
        {/* Section: Responsible Party Details */}
        <div>
          <h2 className='text-lg font-semibold text-gray-600 mb-4'>Mailing Address</h2>
          <div className='grid grid-cols-2 gap-x-8 gap-y-4'>
            <p className='text-sm text-gray-500'>
              Address: <span className='text-gray-900'>3132 5th Ave</span>
            </p>
            <p className='text-sm text-gray-500'>
              City: <span className='text-gray-900'>ABC</span>
            </p>
            <p className='text-sm text-gray-500'>
              State: <span className='text-gray-900'>MN</span>
            </p>
            <p className='text-sm text-gray-500'>
              Zip: <span className='text-gray-900'>55408</span>
            </p>
            <span className='text-base text-gray-500'>Pay Rate</span>
          </div>
          {/* <CustomButton
            className={"bg-[#4B0082] text-white mt-3 mb-3 w-44"}
            label="Add Pay Rate"
            icon={<PlusOutlined />}
            onClick={() => {}}
          /> */}
        </div>
      </div>

      {/* Section: Service Information */}
      <div className='mt-5 w-full ml-2 bg-white shadow-md rounded-lg p-6'>
        <h2 className='text-lg font-semibold text-gray-600 mb-4'>PCA UMPI Information</h2>
        <div className='grid grid-cols-2 gap-x-8 gap-y-4'>
          <p className='text-sm text-gray-500'>
            Payor: <span className='text-gray-900'>No</span>
          </p>
          <p className='text-sm text-gray-500'>
            UMPI: <span className='text-gray-900'>NA</span>
          </p>
        </div>
        <div className='grid grid-cols-2 gap-x-8 gap-y-4'>
          <p className='text-sm text-gray-500'>
            Activation Date: <span className='text-gray-900'>No</span>
          </p>
          <p className='text-sm text-gray-500'>
            Expiry Date: <span className='text-gray-900'>NA</span>
          </p>
        </div>
        <div className='grid grid-cols-2 gap-x-8 gap-y-4'>
          <p className='text-sm text-gray-500'>
            Fax Date: <span className='text-gray-900'>No</span>
          </p>
          <p className='text-sm text-gray-500'>
            Recieved Date: <span className='text-gray-900'>NA</span>
          </p>
        </div>
      </div>

      {/* Section: Service Plan Details */}
      <div className='mt-5 w-full ml-2 bg-white shadow-md rounded-lg p-6'>
        <h2 className='text-xl font-semibold text-gray-600 mb-4'>Caregiver Notes</h2>
        <label className='text-lg text-gray-500'>Allergies</label>
        <div className='space-y-4'>
          <div>
            <p className='text-sm text-gray-500'>
              <span className='text-gray-900'>IHS (with training) (H2014 UC U3)</span> (Aug 1, 2023 - Nov 27, 2024)
              Approved Units: 1040 - <span className='text-gray-900'> 0.5 Hrs/Day - 3.75 Hrs/Week</span>
            </p>
          </div>
          <div>
            <p className='text-sm text-gray-500'>
              Community Integration & Socialization: Assist with Community Participation, Entertainments, Activities,
              Health, Safety & Wellness, and completing Paperwork
            </p>
          </div>
          <div>
            <p className='text-sm text-gray-500'>
              <span className='text-gray-900'>Integrated Community Supports Daily (T1020 UC):</span> (Nov 28, 2023 - Jul
              31, 2024) Approved Units: <span className='text-gray-900'>248 - 0.25 Hrs/Day - 1.75 Hrs/Week </span>
            </p>
          </div>
          <div>
            <p className='text-sm text-gray-500'>
              Going to store, Home Organization, Community Activity, Budgeting, Assist with scheduling ride to attend
              medical appointments, Client will work towards improving his health by being physically active/gym.,
              Assist with reading and organizing mails
            </p>
          </div>
        </div>
        <div className='mb-6 border-t pt-6'>
          <div className='grid grid-cols-2 gap-x-8 gap-y-4'>
            <p className='text-sm text-gray-500'>
              Available Services: <span className='text-gray-900'>---</span>
            </p>
            <p className='text-sm text-gray-500'>
              Place of Services: <span className='text-gray-900'>---</span>
            </p>
            <p className='text-sm text-gray-500'>
              Client Location: <span className='text-gray-900'>---</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CaregiverAboutCard
