import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useUsers } from "@/hooks/useUsers";
import { Edit, Trash2 } from "lucide-react";
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";

// Define permission options
const permissionOptions = [
  { id: "create_user", label: "إنشاء مستخدم" },
  { id: "edit_user", label: "تعديل المستخدمين" },
  { id: "delete_user", label: "حذف المستخدمين" },
  { id: "view_documents", label: "عرض الوثائق" },
  { id: "edit_documents", label: "تحرير الوثائق" },
];

type Permission = "create_user" | "edit_user" | "delete_user" | "view_documents" | "edit_documents";

const UsersManagement = () => {
  const { users, isLoading, addUser, deleteUser, updateUser } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddUserDialogOpen, setIsAddUserDialogOpen] = useState(false);
  const [isEditUserDialogOpen, setIsEditUserDialogOpen] = useState(false);
  
  const [newUser, setNewUser] = useState({
    username: "",
    fullName: "",
    password: "",
    role: "user",
    permissions: [] as Permission[],
  });
  
  const [editUser, setEditUser] = useState({
    username: "",
    fullName: "",
    password: "",
    role: "user" as "admin" | "user",
    permissions: [] as Permission[],
  });
  
  const filteredUsers = users?.filter(user =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const handleAddUser = async () => {
    await addUser(newUser);
    setNewUser({ username: "", fullName: "", password: "", role: "user", permissions: [] });
    setIsAddUserDialogOpen(false);
  };
  
  const handleUpdateUser = async () => {
    const success = await updateUser(editUser.username, {
      fullName: editUser.fullName,
      password: editUser.password || undefined,
      role: editUser.role,
      permissions: editUser.permissions,
    });
    
    if (success) {
      setIsEditUserDialogOpen(false);
    }
  };
  
  const handleEditUser = (user) => {
    setEditUser({
      username: user.username,
      fullName: user.fullName,
      password: "",
      role: user.role,
      permissions: [...user.permissions],
    });
    setIsEditUserDialogOpen(true);
  };
  
  const toggleNewUserPermission = (permission: Permission) => {
    setNewUser(prev => {
      if (prev.permissions.includes(permission)) {
        return { ...prev, permissions: prev.permissions.filter(p => p !== permission) };
      } else {
        return { ...prev, permissions: [...prev.permissions, permission] };
      }
    });
  };
  
  const toggleEditUserPermission = (permission: Permission) => {
    setEditUser(prev => {
      if (prev.permissions.includes(permission)) {
        return { ...prev, permissions: prev.permissions.filter(p => p !== permission) };
      } else {
        return { ...prev, permissions: [...prev.permissions, permission] };
      }
    });
  };
  
  return (
    <>
      <div className="bg-[#221F26] rounded-lg border border-[#3A3A3C] p-4 shadow-md">
        <div className="mb-4 flex flex-col sm:flex-row justify-between items-center gap-3">
          <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Input
              placeholder="بحث..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="bg-[#2A2D3A] border-[#3A3A3C] text-white placeholder:text-gray-400 w-full sm:w-72"
            />
            <Button 
              className="bg-[#D4AF37] hover:bg-[#BF9F30] text-black font-cairo"
              onClick={() => setIsAddUserDialogOpen(true)}
            >
              إضافة مستخدم
            </Button>
          </div>
          <h2 className="text-xl font-bold text-[#D4AF37] font-cairo">إدارة المستخدمين</h2>
        </div>

        <div className="rounded-md border border-[#3A3A3C] overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#2A2D3A] hover:bg-[#2A2D3A]">
                <TableHead className="text-left font-cairo text-gray-300">الإجراءات</TableHead>
                <TableHead className="text-right font-cairo text-gray-300">اسم المستخدم</TableHead>
                <TableHead className="text-right font-cairo text-gray-300">الإسم الكامل</TableHead>
                <TableHead className="text-right font-cairo text-gray-300">الدور</TableHead>
                <TableHead className="text-right font-cairo text-gray-300">الصلاحيات</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    <div className="flex justify-center">
                      <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers && filteredUsers.length > 0 ? (
                filteredUsers.map((user) => (
                  <TableRow key={user.username} className="hover:bg-[#2A2D3A]">
                    <TableCell>
                      <div className="flex gap-2 justify-start">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleEditUser(user)}
                          className="text-blue-400 border-blue-400 hover:bg-blue-400 hover:text-black"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => deleteUser(user.username)}
                          className="text-red-400 border-red-400 hover:bg-red-400 hover:text-black"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-right">{user.username}</TableCell>
                    <TableCell className="text-right">{user.fullName}</TableCell>
                    <TableCell className="text-right">
                      <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${
                        user.role === "admin" ? "bg-amber-500/20 text-amber-400" : "bg-blue-500/20 text-blue-400"
                      }`}>
                        {user.role === "admin" ? "مدير النظام" : "مستخدم"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex flex-wrap gap-1 justify-end">
                        {user.permissions.length > 0 ? (
                          user.permissions.map((permission) => (
                            <span 
                              key={permission} 
                              className="inline-block px-2 py-1 rounded text-xs font-medium bg-purple-500/20 text-purple-400"
                            >
                              {permissionOptions.find(p => p.id === permission)?.label || permission}
                            </span>
                          ))
                        ) : (
                          <span className="text-gray-400 text-xs">لا توجد صلاحيات</span>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center text-gray-400">
                    لا يوجد مستخدمين
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>
      
      <Dialog open={isAddUserDialogOpen} onOpenChange={setIsAddUserDialogOpen}>
        <DialogContent className="bg-[#221F26] text-white border-[#3A3A3C] max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-[#D4AF37] font-cairo">إضافة مستخدم جديد</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="fullName" className="text-sm font-medium text-gray-200 font-cairo">
                الإسم الكامل
              </label>
              <Input
                id="fullName"
                value={newUser.fullName}
                onChange={(e) => setNewUser({ ...newUser, fullName: e.target.value })}
                className="bg-[#2A2D3A] border-[#3A3A3C] text-white"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="username" className="text-sm font-medium text-gray-200 font-cairo">
                اسم المستخدم
              </label>
              <Input
                id="username"
                value={newUser.username}
                onChange={(e) => setNewUser({ ...newUser, username: e.target.value })}
                className="bg-[#2A2D3A] border-[#3A3A3C] text-white"
                dir="ltr"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-200 font-cairo">
                كلمة المرور
              </label>
              <Input
                id="password"
                type="password"
                value={newUser.password}
                onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                className="bg-[#2A2D3A] border-[#3A3A3C] text-white"
                dir="ltr"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="role" className="text-sm font-medium text-gray-200 font-cairo">
                الدور
              </label>
              <Select
                value={newUser.role}
                onValueChange={(value) => setNewUser({ ...newUser, role: value as "admin" | "user" })}
              >
                <SelectTrigger className="bg-[#2A2D3A] border-[#3A3A3C] text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#221F26] border-[#3A3A3C] text-white">
                  <SelectItem value="admin" className="focus:bg-[#2A2D3A] focus:text-white">مدير النظام</SelectItem>
                  <SelectItem value="user" className="focus:bg-[#2A2D3A] focus:text-white">مستخدم</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-200 font-cairo">
                الصلاحيات
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {permissionOptions.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={`add-permission-${permission.id}`}
                      checked={newUser.permissions.includes(permission.id as Permission)}
                      onCheckedChange={() => toggleNewUserPermission(permission.id as Permission)}
                      className="data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37]"
                    />
                    <label
                      htmlFor={`add-permission-${permission.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {permission.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddUserDialogOpen(false)}>
              إلغاء
            </Button>
            <Button 
              className="bg-[#D4AF37] hover:bg-[#BF9F30] text-black font-cairo"
              onClick={handleAddUser}
            >
              إضافة
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isEditUserDialogOpen} onOpenChange={setIsEditUserDialogOpen}>
        <DialogContent className="bg-[#221F26] text-white border-[#3A3A3C] max-w-lg" dir="rtl">
          <DialogHeader>
            <DialogTitle className="text-[#D4AF37] font-cairo">تعديل المستخدم</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label htmlFor="edit-fullName" className="text-sm font-medium text-gray-200 font-cairo">
                الإسم الكامل
              </label>
              <Input
                id="edit-fullName"
                value={editUser.fullName}
                onChange={(e) => setEditUser({ ...editUser, fullName: e.target.value })}
                className="bg-[#2A2D3A] border-[#3A3A3C] text-white"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="edit-username" className="text-sm font-medium text-gray-200 font-cairo">
                اسم المستخدم
              </label>
              <Input
                id="edit-username"
                value={editUser.username}
                disabled
                className="bg-[#2A2D3A] border-[#3A3A3C] text-gray-500"
                dir="ltr"
              />
              <p className="text-xs text-gray-400">لا يمكن تغيير اسم المستخدم</p>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="edit-password" className="text-sm font-medium text-gray-200 font-cairo">
                كلمة المرور الجديدة
              </label>
              <Input
                id="edit-password"
                type="password"
                value={editUser.password}
                onChange={(e) => setEditUser({ ...editUser, password: e.target.value })}
                className="bg-[#2A2D3A] border-[#3A3A3C] text-white"
                dir="ltr"
                placeholder="اتركها فارغة إذا لم ترغب بتغييرها"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="edit-role" className="text-sm font-medium text-gray-200 font-cairo">
                الدور
              </label>
              <Select
                value={editUser.role}
                onValueChange={(value) => setEditUser({ ...editUser, role: value as "admin" | "user" })}
              >
                <SelectTrigger className="bg-[#2A2D3A] border-[#3A3A3C] text-white" id="edit-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-[#221F26] border-[#3A3A3C] text-white">
                  <SelectItem value="admin" className="focus:bg-[#2A2D3A] focus:text-white">مدير النظام</SelectItem>
                  <SelectItem value="user" className="focus:bg-[#2A2D3A] focus:text-white">مستخدم</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-3">
              <label className="text-sm font-medium text-gray-200 font-cairo">
                الصلاحيات
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                {permissionOptions.map((permission) => (
                  <div key={permission.id} className="flex items-center space-x-2 space-x-reverse">
                    <Checkbox
                      id={`edit-permission-${permission.id}`}
                      checked={editUser.permissions.includes(permission.id as Permission)}
                      onCheckedChange={() => toggleEditUserPermission(permission.id as Permission)}
                      className="data-[state=checked]:bg-[#D4AF37] data-[state=checked]:border-[#D4AF37]"
                    />
                    <label
                      htmlFor={`edit-permission-${permission.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {permission.label}
                    </label>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditUserDialogOpen(false)}>
              إلغاء
            </Button>
            <Button 
              className="bg-[#D4AF37] hover:bg-[#BF9F30] text-black font-cairo"
              onClick={handleUpdateUser}
            >
              حفظ التغييرات
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default UsersManagement;
