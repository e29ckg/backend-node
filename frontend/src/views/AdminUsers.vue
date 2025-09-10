<template>
  <div>
    <h1>Admin - Manage Users</h1>
    <p>หน้านี้สำหรับแอดมินดูและจัดการผู้ใช้</p>
    <table>
      <thead>
        <tr>
          <th>Username/Email</th>
          <th>Role</th>
          <th>Action</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="user in users" :key="user.id">
          <td>{{ user.email }}</td>
          <td>{{ user.role }}</td>
          <td>
            <button @click="editUser(user.id)">Edit</button>
            <button @click="deleteUser(user.id)">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
    <div>
      <p v-if="users.length === 0">No users found.</p>
    </div>
  </div>
</template>

<script setup>
// ถ้าต้องการดึงข้อมูลผู้ใช้จาก API
import { ref, onMounted } from 'vue';
import { getUsers } from '#/api/auth.js';

const users = ref([]);
onMounted(async () => {
  const res = await getUsers();
  users.value = res.data;
});
const editUser = (userId) => {
  // ฟังก์ชันสำหรับแก้ไขผู้ใช้
  alert(`Edit user with ID: ${userId}`);  
};
const viewUser = (userId) => {
  // ฟังก์ชันสำหรับดูรายละเอียดผู้ใช้
  alert(`View user with ID: ${userId}`);
  getUsers();
};
const deleteUser = (userId) => {
  // ฟังก์ชันสำหรับลบผู้ใช้
  alert(`Delete user with ID: ${userId}`);
};

</script>

<style scoped>
h1 {
  margin-bottom: 1rem;
}
</style>