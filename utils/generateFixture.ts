import { Teams, TiposPartido } from "@/types";

const isEven = (num: number)=>{
    return num % 2 === 0
}

export const generarFixtureTodosContraTodos = (equipos: any[], tipoPartido: string )=>{
const totalEquipos = equipos.length
const equipoPar = isEven(totalEquipos)
const totalFechas = equipoPar? totalEquipos - 1 : totalEquipos
const totalPartidos = (totalEquipos * (totalEquipos - 1)) / 2
const partidosPorDia = equipoPar? totalPartidos / totalFechas :  totalPartidos / totalFechas + 1

// cuando cantidad de partidos es par local siempre es 1 | impar entonces es "Descansa"
// los demas equipos van rotando inverso a las manecillas del reloj

// ida
const partidos = []

for(let i = 0; i < totalFechas; i++){
  const partidoDia = []
  for(let j = 0; j < partidosPorDia; j++){    
     let versus = {local:'local', visitante: 'home'}
     partidoDia.push(versus)
  }
  partidos.push(partidoDia)
  
  partidos.forEach((partido, idx) =>{    
    
    let teamsCopy = equipos.slice()

    if(!equipoPar){
      teamsCopy.unshift('Descansa')
    }
    
    if(idx > 0 ){
      const last = teamsCopy.splice(-idx)
      teamsCopy.splice(1, 0, ...last) // ubico en la posicion 1 a los ultimos equipos ya usados
    }
    
    partido.forEach((par, index)=>{      
      par.local = teamsCopy[0] // agrego primer equipo
      teamsCopy.shift() // elimino primer equipo una vez agregado
      par.visitante = teamsCopy[teamsCopy.length - 1] // agrego ultimo equipo
      teamsCopy.pop() // elimino ultimo equipo una vez agregado
      
    })
  })  
}
  
// vuelta
let partidosVuelta = <any>[]
if(tipoPartido === 'ida y vuelta'){
  partidosVuelta = partidos.map(partido =>
    partido.map(par=>({local: par.visitante ,visitante: par.local}))
  )
}
  
 return {ida: partidos, vuelta: partidosVuelta}
}

export const generarFixtureEliminacion = (equipos: any[], tipoPartido: string )=>{



}