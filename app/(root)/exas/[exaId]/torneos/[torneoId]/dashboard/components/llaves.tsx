import { Teams } from '@/types'
import Image from 'next/image'
import React from 'react'

interface LlavesProps {
  teams: Teams[]
}

const Llaves = ({ teams }: LlavesProps) => {
  const octavos = teams.length === 16
  const cuartos = teams.length === 8
  const semis = teams.length === 4
  const final = false

  return (
    <div className='shadow-xl p-5 bg-white rounded m-auto h-auto'>
      <div
        className={`grid gap-2 ${
          octavos ? 'grid-cols-7' : cuartos ? 'grid-cols-5' : 'grid-cols-3'
        }`}>
        {octavos && (
          <div className='text-center flex flex-col gap-5'>
            <h2 className='text-muted-foreground text-xs px-2 rounded shadow'>
              <strong>8</strong>
              <sup>vos</sup>
            </h2>
            <div className='flex flex-col gap-8'>
              <div className='grid grid-cols-1 grid-rows-2 gap-3 place-items-center relative'>
                <span className='absolute right-0 top-[50%] w-7 h-[90%] border-r rounded-r border-y border-pink-800 translate-y-[-50%]'></span>
                <span className='w-12 h-12 bg-white shrink-0 border rounded shadow relative'>
                  <Image
                    src={teams[0].image_url!}
                    fill
                    className='object-contain'
                    alt='team logo'
                  />
                </span>
                <span className='w-12 h-12 bg-white shrink-0 border rounded shadow relative'>
                  <Image
                    src={teams[1].image_url!}
                    fill
                    className='object-contain'
                    alt='team logo'
                  />
                </span>
              </div>
              <div className='grid grid-cols-1 grid-rows-2 gap-3 place-items-center relative'>
                <span className='absolute right-0 top-[50%] w-7 h-[90%] border-r rounded-r border-y border-pink-800 translate-y-[-50%]'></span>
                <span className='w-12 h-12 bg-white shrink-0 border rounded shadow relative'>
                  <Image
                    src={teams[2].image_url!}
                    fill
                    className='object-contain'
                    alt='team logo'
                  />
                </span>
                <span className='w-12 h-12 bg-white shrink-0 border rounded shadow relative'>
                  <Image
                    src={teams[3].image_url!}
                    fill
                    className='object-contain'
                    alt='team logo'
                  />
                </span>
              </div>
              <div className='grid grid-cols-1 grid-rows-2 gap-3 place-items-center relative'>
                <span className='absolute right-0 top-[50%] w-7 h-[90%] border-r rounded-r border-y border-pink-800 translate-y-[-50%]'></span>
                <span className='w-12 h-12 bg-white shrink-0 border rounded shadow relative'>
                  <Image
                    src={teams[4].image_url!}
                    fill
                    className='object-contain'
                    alt='team logo'
                  />
                </span>
                <span className='w-12 h-12 bg-white shrink-0 border rounded shadow relative'>
                  <Image
                    src={teams[5].image_url!}
                    fill
                    className='object-contain'
                    alt='team logo'
                  />
                </span>
              </div>
              <div className='grid grid-cols-1 grid-rows-2 gap-3 place-items-center relative'>
                <span className='absolute right-0 top-[50%] w-7 h-[90%] border-r rounded-r border-y border-pink-800 translate-y-[-50%]'></span>
                <span className='w-12 h-12 bg-white shrink-0 border rounded shadow relative'>
                  <Image
                    src={teams[6].image_url!}
                    fill
                    className='object-contain'
                    alt='team logo'
                  />
                </span>
                <span className='w-12 h-12 bg-white shrink-0 border rounded shadow relative'>
                  <Image
                    src={teams[7].image_url!}
                    fill
                    className='object-contain'
                    alt='team logo'
                  />
                </span>
              </div>
            </div>
          </div>
        )}

        {(octavos || cuartos) && (
          <div className='text-center flex flex-col gap-5 z-20'>
            <h2 className='text-muted-foreground text-xs px-2 rounded shadow'>
              <strong>4</strong>
              <sup>tos</sup>
            </h2>
            <div className='grid grid-cols-1 grid-rows-4 h-full gap-8'>
              <div className='row-span-2 flex flex-col gap-3 relative'>
                <span className='absolute right-0 top-[50%] w-7 h-[67%] border-r rounded-r border-y border-pink-800 translate-y-[-50%]'></span>
                <div className='flex items-center justify-center h-full'>
                  <span className='w-12 h-12 bg-white shrink-0 border rounded shadow relative row-span-2'>
                    {cuartos && (
                      <Image
                        src={teams[0].image_url!}
                        fill
                        className='object-contain'
                        alt='team logo'
                      />
                    )}
                  </span>
                </div>
                <div className='flex items-center justify-center h-full'>
                  <span className='w-12 h-12 bg-white shrink-0 border rounded shadow relative row-span-2'>
                    {cuartos && (
                      <Image
                        src={teams[1].image_url!}
                        fill
                        className='object-contain'
                        alt='team logo'
                      />
                    )}
                  </span>
                </div>
              </div>
              <div className='row-span-2 flex flex-col gap-3 relative'>
                <span className='absolute right-0 top-[50%] w-7 h-[67%] border-r rounded-r border-y border-pink-800 translate-y-[-50%]'></span>
                <div className='flex items-center justify-center h-full'>
                  <span className='w-12 h-12 bg-white shrink-0 border rounded shadow relative row-span-2'>
                    {cuartos && (
                      <Image
                        src={teams[2].image_url!}
                        fill
                        className='object-contain'
                        alt='team logo'
                      />
                    )}
                  </span>
                </div>
                <div className='flex items-center justify-center h-full'>
                  <span className='w-12 h-12 bg-white shrink-0 border rounded shadow relative row-span-2'>
                    {cuartos && (
                      <Image
                        src={teams[3].image_url!}
                        fill
                        className='object-contain'
                        alt='team logo'
                      />
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className='text-center flex flex-col gap-5 z-20'>
          <h2 className='text-muted-foreground text-xs px-2 rounded shadow'>
            Semifinal
          </h2>
          <div className='grid grid-cols-1 grid-rows-2 h-full gap-8'>
            <div className='row-span-2 flex flex-col gap-3 relative'>
              <span className='absolute right-0 top-[50%] w-7 h-[58%] border-r rounded-r border-y border-pink-800 translate-y-[-50%]'></span>
              <div className='flex items-center justify-center h-full'>
                <span className='w-12 h-12 bg-white shrink-0 border rounded shadow relative row-span-2'>
                  {semis && (
                    <Image
                      src={teams[0].image_url!}
                      fill
                      className='object-contain'
                      alt='team logo'
                    />
                  )}
                </span>
              </div>
              <div className='flex items-center justify-center h-full'>
                <span className='w-12 h-12 bg-white shrink-0 border rounded shadow relative row-span-2'>
                  {semis && (
                    <Image
                      src={teams[1].image_url!}
                      fill
                      className='object-contain'
                      alt='team logo'
                    />
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className='text-center flex flex-col gap-5 z-30'>
          <h2 className='text-muted-foreground text-xs px-2 rounded shadow font-semibold'>
            Final
          </h2>
          <div className='grid grid-cols-1 h-full gap-8'>
            <div className='flex flex-col gap-3'>
              <div className='flex items-center justify-center h-full gap-1 relative'>
                <span className='w-12 h-12 bg-white shrink-0 border rounded shadow relative'>
                  {final && (
                    <Image
                      src={teams[0].image_url!}
                      fill
                      className='object-contain'
                      alt='team logo'
                    />
                  )}
                </span>
                <span className='w-12 h-12 bg-white shrink-0 border rounded shadow relative'>
                  {final && (
                    <Image
                      src={teams[1].image_url!}
                      fill
                      className='object-contain'
                      alt='team logo'
                    />
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className='text-center flex flex-col gap-5 z-20'>
          <h2 className='text-muted-foreground text-xs px-2 rounded shadow'>
            Semifinal
          </h2>
          <div className='grid grid-cols-1 grid-rows-2 h-full gap-8'>
            <div className='row-span-2 flex flex-col gap-3 relative'>
              <span className='absolute left-0 top-[50%] w-7 h-[58%] border-l rounded-l border-y border-pink-800 translate-y-[-50%]'></span>
              <div className='flex items-center justify-center h-full'>
                <span className='w-12 h-12 bg-white shrink-0 border rounded shadow row-span-2 relative'>
                  {semis && (
                    <Image
                      src={teams[2].image_url!}
                      fill
                      className='object-contain'
                      alt='team logo'
                    />
                  )}
                </span>
              </div>
              <div className='flex items-center justify-center h-full'>
                <span className='w-12 h-12 bg-white shrink-0 border rounded shadow row-span-2 relative'>
                  {semis && (
                    <Image
                      src={teams[3].image_url!}
                      fill
                      className='object-contain'
                      alt='team logo'
                    />
                  )}
                </span>
              </div>
            </div>
          </div>
        </div>

        {(octavos || cuartos) && (
          <div className='text-center flex flex-col gap-5 z-20'>
            <h2 className='text-muted-foreground text-xs px-2 rounded shadow'>
              <strong>4</strong>
              <sup>tos</sup>
            </h2>
            <div className='grid grid-cols-1 grid-rows-4 h-full gap-8 w-full'>
              <div className='row-span-2 flex flex-col gap-3 relative'>
                <span className='absolute left-0 top-[50%] w-7 h-[67%] border-l rounded-l border-y border-pink-800 translate-y-[-50%]'></span>
                <div className='flex items-center justify-center h-full'>
                  <span className='w-12 h-12 bg-white shrink-0 border rounded shadow row-span-2 relative'>
                    {cuartos && (
                      <Image
                        src={teams[4].image_url!}
                        fill
                        className='object-contain'
                        alt='team logo'
                      />
                    )}
                  </span>
                </div>
                <div className='flex items-center justify-center h-full'>
                  <span className='w-12 h-12 bg-white shrink-0 border rounded shadow row-span-2 relative'>
                    {cuartos && (
                      <Image
                        src={teams[5].image_url!}
                        fill
                        className='object-contain'
                        alt='team logo'
                      />
                    )}
                  </span>
                </div>
              </div>
              <div className='row-span-2 flex flex-col gap-3 relative'>
                <span className='absolute left-0 top-[50%] w-7 h-[67%] border-l rounded-l border-y border-pink-800 translate-y-[-50%]'></span>
                <div className='flex items-center justify-center h-full'>
                  <span className='w-12 h-12 bg-white shrink-0 border rounded shadow row-span-2 relative'>
                    {cuartos && (
                      <Image
                        src={teams[6].image_url!}
                        fill
                        className='object-contain'
                        alt='team logo'
                      />
                    )}
                  </span>
                </div>
                <div className='flex items-center justify-center h-full'>
                  <span className='w-12 h-12 bg-white shrink-0 border rounded shadow row-span-2 relative'>
                    {cuartos && (
                      <Image
                        src={teams[7].image_url!}
                        fill
                        className='object-contain'
                        alt='team logo'
                      />
                    )}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {octavos && (
          <div className='text-center flex flex-col gap-5'>
            <h2 className='text-muted-foreground text-xs px-2 rounded shadow'>
              <strong>8</strong>
              <sup>vos</sup>
            </h2>
            <div className='flex flex-col gap-8'>
              <div className='grid grid-cols-1 grid-rows-2 gap-3 place-items-center relative'>
                <span className='absolute left-0 top-[50%] w-7 h-[90%] border-l rounded-l border-y border-pink-800 translate-y-[-50%]'></span>
                <span className='w-12 h-12 bg-white shrink-0 border rounded shadow relative'>
                  <Image
                    src={teams[8].image_url!}
                    fill
                    className='object-contain'
                    alt='team logo'
                  />
                </span>
                <span className='w-12 h-12 bg-white shrink-0 border rounded shadow relative'>
                  <Image
                    src={teams[9].image_url!}
                    fill
                    className='object-contain'
                    alt='team logo'
                  />
                </span>
              </div>
              <div className='grid grid-cols-1 grid-rows-2 gap-3 place-items-center relative'>
                <span className='absolute left-0 top-[50%] w-7 h-[90%] border-l rounded-l border-y border-pink-800 translate-y-[-50%]'></span>
                <span className='w-12 h-12 bg-white shrink-0 border rounded shadow relative'>
                  <Image
                    src={teams[10].image_url!}
                    fill
                    className='object-contain'
                    alt='team logo'
                  />
                </span>
                <span className='w-12 h-12 bg-white shrink-0 border rounded shadow relative'>
                  <Image
                    src={teams[11].image_url!}
                    fill
                    className='object-contain'
                    alt='team logo'
                  />
                </span>
              </div>
              <div className='grid grid-cols-1 grid-rows-2 gap-3 place-items-center relative'>
                <span className='absolute left-0 top-[50%] w-7 h-[90%] border-l rounded-l border-y border-pink-800 translate-y-[-50%]'></span>
                <span className='w-12 h-12 bg-white shrink-0 border rounded shadow relative'>
                  <Image
                    src={teams[12].image_url!}
                    fill
                    className='object-contain'
                    alt='team logo'
                  />
                </span>
                <span className='w-12 h-12 bg-white shrink-0 border rounded shadow relative'>
                  <Image
                    src={teams[13].image_url!}
                    fill
                    className='object-contain'
                    alt='team logo'
                  />
                </span>
              </div>
              <div className='grid grid-cols-1 grid-rows-2 gap-3 place-items-center relative'>
                <span className='absolute left-0 top-[50%] w-7 h-[90%] border-l rounded-l border-y border-pink-800 translate-y-[-50%]'></span>
                <span className='w-12 h-12 bg-white shrink-0 border rounded shadow relative'>
                  <Image
                    src={teams[14].image_url!}
                    fill
                    className='object-contain'
                    alt='team logo'
                  />
                </span>
                <span className='w-12 h-12 bg-white shrink-0 border rounded shadow relative'>
                  <Image
                    src={teams[15].image_url!}
                    fill
                    className='object-contain'
                    alt='team logo'
                  />
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Llaves
