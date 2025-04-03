import React from 'react'

export default function page() {
  return (
    <div className='m-8'>
      <div className="flex flex-row gap-2 items-center">
        <span className="icon-[mdi--users] text-5xl mx-2"></span>
        <div>
          <h1 className="text-2xl font-bold">User Management</h1>
          <p>Manage users in the application here.</p>
        </div>
      </div>
    </div>
  )
}
