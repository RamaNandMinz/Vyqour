import { GetServerSideProps, GetStaticProps, GetStaticPaths } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const Users = () => {
  return <div>Users Page</div>;
};

export const getServerSideProps: GetServerSideProps = async () => {
  const users = await prisma.user.findMany();
  return { props: { users } };
};

export default Users;