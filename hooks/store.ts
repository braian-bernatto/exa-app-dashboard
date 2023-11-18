import { create } from "zustand";

interface Storetype{
    faseId: number
    faseNro: number
    tipoPartido: number
}

export const useStore = create<Storetype>((set)=>({
    faseId: 0,
    faseNro: 0,
    tipoPartido: 0,    
}))