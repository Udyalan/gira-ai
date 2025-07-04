// pages/index.tsx
import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: "2rem", fontFamily: "Arial, sans-serif" }}>
      <h1>Bem-vindo ao Gira.ai</h1>
      <p>Seu sistema inteligente para pequenos negócios está em desenvolvimento.</p>
      <nav>
        <ul>
          <li>
            <Link href="/dashboard">
              <a style={{ color: "#2563eb" }}>Dashboard Financeiro</a>
            </Link>
          </li>
          <li>
            <Link href="/upload">
              <a style={{ color: "#2563eb" }}>Upload de Planilhas</a>
            </Link>
          </li>
          <li>
            <Link href="/calculator">
              <a style={{ color: "#2563eb" }}>Calculadora de Preços</a>
            </Link>
          </li>
        </ul>
      </nav>
      <style jsx>{`
        ul {
          list-style-type: none;
          padding: 0;
        }
        li {
          margin-bottom: 1rem;
        }
        a {
          text-decoration: none;
          font-weight: 600;
        }
        a:hover {
          text-decoration: underline;
        }
      `}</style>
    </main>
  );
}
