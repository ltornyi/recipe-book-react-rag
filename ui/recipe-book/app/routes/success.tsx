import { useEffect, useState } from "react";
import type { Route } from "./+types/success";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Success" },
    { name: "description", content: "Successful login" },
  ];
}

export default function Success() {

  const [userId, setUserId] = useState(null);
  const [dbTime, setDbTime] = useState('');

  useEffect(() => {    
    fetch('/.auth/me')
      .then(response => response.json())
      .then(data => {
        console.log('.auth/me response', data);
        setUserId(data.clientPrincipal.userId);
    });
  }, []);

  useEffect(() => {    
    fetch('/api/db-time')
      .then(response => response.json())
      .then(data => {
        console.log('api/db-time response', data);
        setDbTime(data.databaseTimeUtc);
    });
  }, [userId]);

  return <div>
        <p>Success, userId:{userId}</p>
        <p>dbTime:{dbTime}</p>
        <a href="/logout">Logout</a>
    </div>;
}
