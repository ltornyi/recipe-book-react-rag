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
  const [hello, setHello] = useState('');

  useEffect(() => {    
    fetch('/.auth/me')
      .then(response => response.json())
      .then(data => {
        console.log(data);
        setUserId(data.clientPrincipal.userId);
    });
  }, []);

  useEffect(() => {    
    fetch(`/api/hello?name=${encodeURIComponent(userId || '')}`)
      .then(response => response.text())
      .then(data => {
        console.log(data);
        setHello(data);
    });
  }, [userId]);

  return <div>
        <p>Success, userId:{userId}</p>
        <p>message:{hello}</p>
        <a href="/logout">Logout</a>
    </div>;
}
