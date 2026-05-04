import {useState,useEffect,useRef} from "react";

export type Point ={ time:string;cpu:number;ram:number};
export type Server ={id:number;name:string;status:string;points:Point[]};

export function useStats(url:string){
  const[servers,setServers]=useState<Server[]>([]);
  const[connected,setConnected]=useState(false);

  const cache = useRef<Record<number, Server>>({});           //хранение истории

  useEffect(() => {
    const ws = new WebSocket(url);                            //соединение с сервером

    ws.onopen = () => setConnected(true);                     //успешно установлено

    ws.onclose = () => setConnected(false);                   //закрылось соединение

    ws.onmessage = (e) => {                                   //соо от сервера
      const list = JSON.parse(e.data);
      

      for (const m of list) {
        const old = cache.current[m.server_id];

        const newPoint = {                                    //новая точка для графика
          time: new Date(m.time).toLocaleTimeString(),        
          cpu: m.cpu,
          ram: m.ram,
        };

        const points=old?[...old.points,newPoint] : [newPoint];

        cache.current[m.server_id]={                        //хранение последних 30 точек
          id: m.server_id,
          name: m.server_name,
          status: m.status,
          points: points.slice(-30),
        };
      }

      setServers(Object.values(cache.current));                //обновление списка серверов
    };

    return () => ws.close();                                   //закрыть соединение
  }, [url]);

  return { servers, connected };
}



//toLocaleTimeString — метод экземпляра объекта Date в JavaScript,
//который возвращает строку, содержащую зависимое от языка представление
//времени этой даты в локальном часовом поясе