import { useState } from 'react'

import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div class="flex flex-row p-1.5 m-1.5 text-white">

        <aside class="hidden fixed w-[250px] border-r-1 lg:flex justify-center">
          <ul class="flex flex-col justify-end space-y-10 space-x-1.5 py-16">
            <li class="flex justify-start gap-3"><span class="material-symbols-outlined">home</span>
            Home</li>
            <li class="flex justify-start gap-3"><span class="material-symbols-outlined">search</span>
            Search</li>
            <li class="flex justify-start gap-3"><span class="material-symbols-outlined">explore</span>
            Explore</li>
            <li class="flex justify-start gap-3"><span class="material-symbols-outlined">video_library</span>
            Reels</li>
            <li class="flex justify-start gap-3"><span class="material-symbols-outlined">chat</span>
            Messages</li>
            <li class="flex justify-start gap-3"><span class="material-symbols-outlined">favorite</span> Notifications</li>
            <li class="flex justify-start gap-3"><span class="material-symbols-outlined">add</span>
            Create</li>
            <li class="flex justify-start gap-3"><span class="material-symbols-outlined">account_circle</span> Profile</li>
            <li class="flex justify-start gap-3"><span class="material-symbols-outlined">menu</span>
            More</li>
          </ul>
        </aside>

        <div class="content w-full flex justify-center">

          <p>Hello</p>
        </div>

        <div class="follow w-[30%] border-l-1 border-gray-800 flex justify-center">
          <p>test</p>
        </div>

      </div>
    </>
  )
}

export default App
