import { Fases, Teams, TiposPartido } from "@/types";

const isEven = (num: number)=>{
    return num % 2 === 0
}

export const generarFixtureTodosContraTodos = (equipos: Teams[], tipoPartido?: TiposPartido )=>{
const totalEquipos = equipos.length
const totalFechas = isEven(totalEquipos)? totalEquipos - 1 : totalEquipos
const totalPartidos = (totalEquipos * (totalEquipos - 1)) / 2

// cuando es par el primer equipo va de local
// los demas equipos van rotando hacia las manecillas del reloj


// cuando es impar descansa primer equipo (puede variar) hacia las manecillas del reloj 


}

export const generarFixtureEliminacion = (equipos: Teams[], tipoPartido?: TiposPartido )=>{



}