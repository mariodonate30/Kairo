import { useAdminData } from '../hooks/useAdminData'
import AdminPanel from '../components/admin/AdminPanel'

export default function Admin() {
  const admin = useAdminData()
  return <AdminPanel admin={admin} />
}
