// Component Imports
import TenantList from '@views/apps/tenant/list'

// Data Imports
import { getUserData } from '@/app/server/actions'

/**
 * ! If you need data using an API call, uncomment the below API code, update the `process.env.API_URL` variable in the
 * ! `.env` file found at root of your project and also update the API endpoints like `/apps/user-list` in below example.
 * ! Also, remove the above server action import and the action itself from the `src/app/server/actions.ts` file to clean up unused code
 * ! because we've used the server action for getting our static data.
 */

/* const getUserData = async () => {
  // Vars
  const res = await fetch(`${process.env.API_URL}/apps/user-list`)

  if (!res.ok) {
    throw new Error('Failed to fetch userData')
  }

  return res.json()
} */

const TenantListApp = async () => {
    // Vars
    // const data = await getUserData()
    // const [data, setData] = useState([])

    // useEffect(() => {
    //   ;(async () => {
    //     const tenantData = await axios.get(`${process.env.NEXT_PUBLIC_API_URL}/tenant`)
    //     const data = tenantData.data
    //     setData(data)
    //   })()
    // }, [])

    return <TenantList />
}

export default TenantListApp
