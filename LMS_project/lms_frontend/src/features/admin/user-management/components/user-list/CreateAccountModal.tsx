import { X } from "lucide-react";
import { createAccountSchema, type CreateAccountFormData } from "../../schemas";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from 'react-hook-form';
import { useCreateAccount } from "../../api";

interface CreateAccountModalProps {
  setIsCreateAccountModalOpen: (isOpen: boolean) => void;
}

const CreateAccountModal = ({ setIsCreateAccountModalOpen }: CreateAccountModalProps) => {

    const { register, handleSubmit } = useForm<CreateAccountFormData>({
        resolver: zodResolver(createAccountSchema),
        defaultValues: {
            email: '',
            password: '',
            confirm_password: '',
            role: 'teacher'
        }
    });

    const {mutate: createAccount, isPending, isError, isSuccess} = useCreateAccount();

    const onSubmit = (data: CreateAccountFormData) => {
        createAccount(data, {
            onSuccess: () => {
                setIsCreateAccountModalOpen(false);
            },
            onError: (error) => {
                console.error('Error creating account:', error);
                // Optionally, you can set an error state here to display an error message in the UI
            }
        })
    };

    return ( 
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm" onClick={() => setIsCreateAccountModalOpen(false)} />
          <div className="relative bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl w-full max-w-md p-6 shadow-xl animate-fade-in">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">Tạo Account Mới</h3>
              <button onClick={() => setIsCreateAccountModalOpen(false)} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Địa chỉ Email</label>
                <input required type="email" {...register('email')} placeholder="email@example.com" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Password</label>
                <input required type="password" {...register('password')} placeholder="••••••••" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Confirm Password</label>
                <input required type="password" {...register('confirm_password')} placeholder="••••••••" className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Chỉ định Vai trò</label>
                <select {...register('role')} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-lg px-4 py-2 text-slate-900 dark:text-white focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500">
                  <option value="teacher">Teacher</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <button disabled={isPending} type="submit" className="w-full mt-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-sm transition-colors">
                {isPending ? 'Đang tạo...' : 'Tạo Account'}
              </button>
            </form>
          </div>
        </div>
     );
}
 
export default CreateAccountModal;