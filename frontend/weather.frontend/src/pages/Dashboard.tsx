import { useState, useEffect } from "react";
import { api } from "@/api/weather.api";


export const Dashboard = () => {
    const [insights, setInsights] = useState([])

    useEffect(()=>{
        async function fetchUser() {
        const res = await api.get(`/api/weather/logs`);
        console.log(res.data);
        setInsights(res.data);
  }

  fetchUser();
    },[]);

    return (
        <div>
            {insights.map((t)=>(
                <div className="flex flex-col border border-rounded">
                    <p key={t._id}>{t.forecastTime}</p>
                    <p>{t.temperature}</p>
                </div>
              
            ))}
        </div>
    )

}