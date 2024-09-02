import { Divider } from '@nextui-org/react'
import PersonalData from './PersonalData/PersonalData'
import Description from './Description/Description'
import SocialMedia from './SocialMedia/SocialMedia'

const Profile = () => {
  return (
    <section className='flex flex-col gap-4'>
        <h2 className='profile-title'>
            Datos de Perfil
        </h2>
        <Divider />
        <PersonalData />
        <Divider />
        <Description />
        <Divider />
        <SocialMedia />
    </section>
  )
}

export default Profile