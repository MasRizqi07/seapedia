'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Loader2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { useAuthStore } from '@/stores/auth-store';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Role } from '@seapedia/types';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

const registerSchema = z
  .object({
    name: z.string().min(2, 'Name must be at least 2 characters'),
    email: z.string().email('Please enter a valid email address'),
    password: z
      .string()
      .min(8, 'Password must be at least 8 characters')
      .regex(/^(?=.*[A-Z])(?=.*\d)/, 'Password must contain at least 1 uppercase letter and 1 number'),
    confirmPassword: z.string(),
    role: z.enum(['BUYER', 'SELLER', 'DRIVER']), // Exclude ADMIN for normal registration
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ['confirmPassword'],
  });

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const setAuth = useAuthStore((state) => state.setAuth);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      role: 'BUYER',
    },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    try {
      // Exclude confirmPassword before sending to API
      const { confirmPassword, ...apiData } = data;
      
      const response = await api.post<{
        user: any;
        accessToken: string;
        refreshToken: string;
      }>('/api/auth/register', apiData);

      setAuth(response.user, response.accessToken, response.refreshToken);
      
      toast({
        variant: 'success',
        title: 'Account created!',
        description: 'Welcome to Seapedia.',
      });

      router.push('/dashboard');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: error instanceof ApiError ? error.message : 'An unexpected error occurred.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="glass-card animate-fade-in-up border-white/10 w-full">
      <CardHeader>
        <CardTitle className="text-2xl text-white">Create an Account</CardTitle>
        <CardDescription className="text-white/60">
          Join Seapedia and experience the best seafood marketplace.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name" className="text-white/80">Full Name</Label>
            <Input
              id="name"
              placeholder="John Doe"
              className="bg-black/20 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-teal-500"
              {...register('name')}
            />
            {errors.name && <p className="text-sm text-red-400">{errors.name.message}</p>}
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white/80">Email</Label>
            <Input
              id="email"
              type="email"
              placeholder="john@example.com"
              className="bg-black/20 border-white/10 text-white placeholder:text-white/30 focus-visible:ring-teal-500"
              {...register('email')}
            />
            {errors.email && <p className="text-sm text-red-400">{errors.email.message}</p>}
          </div>

          <div className="space-y-2">
            <Label className="text-white/80">Account Type</Label>
            <RadioGroup
              defaultValue="BUYER"
              onValueChange={(val: any) => setValue('role', val)}
              className="flex gap-4 pt-2"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="BUYER" id="role-buyer" className="border-white/50 text-teal-400" />
                <Label htmlFor="role-buyer" className="text-white cursor-pointer">Buyer</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="SELLER" id="role-seller" className="border-white/50 text-teal-400" />
                <Label htmlFor="role-seller" className="text-white cursor-pointer">Seller</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="DRIVER" id="role-driver" className="border-white/50 text-teal-400" />
                <Label htmlFor="role-driver" className="text-white cursor-pointer">Driver</Label>
              </div>
            </RadioGroup>
            {errors.role && <p className="text-sm text-red-400">{errors.role.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white/80">Password</Label>
            <Input
              id="password"
              type="password"
              className="bg-black/20 border-white/10 text-white focus-visible:ring-teal-500"
              {...register('password')}
            />
            {errors.password && <p className="text-sm text-red-400">{errors.password.message}</p>}
          </div>

          <div className="space-y-2">
            <Label htmlFor="confirmPassword" className="text-white/80">Confirm Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              className="bg-black/20 border-white/10 text-white focus-visible:ring-teal-500"
              {...register('confirmPassword')}
            />
            {errors.confirmPassword && <p className="text-sm text-red-400">{errors.confirmPassword.message}</p>}
          </div>

          <Button
            type="submit"
            className="w-full bg-teal-500 text-white hover:bg-teal-600 mt-2"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating account...
              </>
            ) : (
              'Create account'
            )}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-white/60">
        Already have an account?{' '}
        <Link href="/login" className="ml-1 text-teal-400 hover:text-teal-300 hover:underline">
          Sign in
        </Link>
      </CardFooter>
    </Card>
  );
}
