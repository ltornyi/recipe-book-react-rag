import type { Route } from "./+types/success";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "Success" },
    { name: "description", content: "Successful login" },
  ];
}

export default function Home() {
  return <div>
        <p>Success</p>
        <a href="/logout">Logout</a>
    </div>;
}
