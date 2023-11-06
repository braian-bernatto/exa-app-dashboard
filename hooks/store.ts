import { create } from "zustand";

interface Storetype{
    fase: number
    tipoPartido: number
}

export const useStore = create<Storetype>((set)=>({
    fase: 0,
    tipoPartido: 0,    
}))