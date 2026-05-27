import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <div className="text-center space-y-4">
        <p className="text-7xl font-black text-purple-500">404</p>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Página no encontrada
        </h1>
        <p className="text-gray-500 max-w-sm">
          La página que buscas no existe o fue movida.
        </p>
        <Link
          href="/dashboard"
          className="inline-block mt-4 px-6 py-2.5 rounded-xl bg-purple-600 text-white font-medium hover:bg-purple-700 transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  );
}