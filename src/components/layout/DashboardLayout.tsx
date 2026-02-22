import { Outlet } from 'react-router-dom'
import Sidebar from './Sidebar'
import Topbar from './Topbar'

export default function DashboardLayout() {
    return (
        <div className="flex min-h-screen bg-background text-foreground font-sans">
            <Sidebar />
            <div className="flex-1 flex flex-col h-screen overflow-hidden">
                <Topbar />
                <main className="flex-1 overflow-y-auto p-4 md:p-8 bg-background">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}
