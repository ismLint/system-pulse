import {useEffect,useState} from "react";

export function useWebSocket(serverId:number){

  const [cpu,setCpu]=useState(0);
  const [ram,setRam]=useState(0);
  const [disk,setDisk]=useState(0);
  const [status,setStatus]=useState("не подключен");

  useEffect(() =>{
    const socket=new WebSocket("ws://localhost:8765");


    socket.onopen=()=> {                             //успешное подключение к серверу
      setStatus("подключен");
      socket.send(JSON.stringify({ 
        action:"subscribe", 
        server_id:serverId 
      }));
    };

    socket.onmessage=(event)=> {                    // приход данных
      const data= JSON.parse(event.data);
      
      if (data.server_id === serverId) {
        setCpu(data.cpu);
        setRam(data.ram);
        setDisk(data.disk_free_gb);
      }
    };

    socket.onclose=() => {
      setStatus("отключен");
    };

    return() => {
      socket.close();
    };

  },[serverId]);

  return {
    cpu: cpu,
    ram: ram,
    disk: disk,
    status: status
  };
}