import React from "react"

const Spinner = () => {
  return (
    <div className="z-50 fixed top-0 left-0 w-full h-full flex items-center justify-center">
      <span className="absolute w-full h-full bg-white opacity-50"></span>
      <div className="flex">
        <div className="relative">
          <div
            className="w-12 h-12 rounded-full absolute
                            border-4 border-solid border-gray-200"
          ></div>

          <div
            className="w-12 h-12 rounded-full animate-spin absolute
                            border-4 border-solid border-emerald-500 border-t-transparent"
          ></div>
        </div>
      </div>
    </div>
  )
}

export default Spinner;
