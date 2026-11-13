
import { prisma } from "../../lib/prisma";
import { createUser } from "../actions";
import { Suspense } from "react";
import { connection } from "next/server";

// Fetch and display users
async function UsersList() {
  await connection();

  const users = await prisma.user.findMany({
    orderBy: {
      createdAt: "desc",
    },
  });

  return (
    <div className="space-y-3">
      {users.map((user) => (
        <div key={user.id} className="border p-4 rounded">
          <h3 className="font-semibold">{user.name}</h3>
          <p>{user.email}</p>
        </div>
      ))}
    </div>
  );
}

// Main page
export default function Home() {
  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">
        User Management
      </h1>

      <form
        action={createUser}
        className="flex flex-col gap-4 max-w-sm"
      >
        <input
          type="text"
          name="name"
          placeholder="Enter name"
          required
          className="border p-3 rounded"
        />

        <input
          type="email"
          name="email"
          placeholder="Enter email"
          required
          className="border p-3 rounded"
        />

        <button
          type="submit"
          className="bg-blue-600 text-white p-3 rounded"
        >
          Add User
        </button>
      </form>

      <h2 className="text-xl font-bold mt-10 mb-4">
        Users List
      </h2>

      <Suspense fallback={<p>Loading users...</p>}>
        <UsersList />
      </Suspense>
    </div>
  );
}
