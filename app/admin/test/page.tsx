export default function AdminTestPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-gray-900 mb-4">Тестовая страница</h1>
        <p className="text-gray-600">Если вы видите это, значит маршрутизация работает!</p>
        <p className="mt-4 text-sm text-gray-500">URL: /admin/test</p>
      </div>
    </div>
  )
}
