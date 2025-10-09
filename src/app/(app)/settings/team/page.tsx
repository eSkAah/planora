'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { Check, Copy, Edit, Loader2, Mail, MoreVertical, Plus, Shield, UserMinus, UserPlus } from 'lucide-react';
import { useEffect, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  Avatar,
  AvatarFallback,
  Badge,
  Button,
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  Input,
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  useToast,
} from '@/components/ui';
import {
  createUser,
  deleteUser,
  getUsers,
  updateUser,
} from '@/lib/actions/users';
import {
  createUserSchema,
  updateUserSchema,
  type CreateUserInput,
  type UpdateUserInput,
} from '@/lib/validations';

const ROLE_LABELS: Record<string, string> = {
  admin: 'Administrateur',
  manager: 'Manager',
  employee: 'Employé',
  viewer: 'Observateur',
};

const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-[#F2E94E] text-[#0A1A2F]',
  manager: 'bg-blue-500 text-white',
  employee: 'bg-gray-500 text-white',
  viewer: 'bg-gray-300 text-gray-700',
};

export default function TeamPage() {
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState<string | null>(null);
  const [userToEdit, setUserToEdit] = useState<string | null>(null);
  const [passwordDialogOpen, setPasswordDialogOpen] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState('');
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [users, setUsers] = useState<
    Array<{
      id: string;
      email: string;
      firstName: string;
      lastName: string;
      role: string;
      phone: string | null;
      isActive: boolean;
      lastLoginAt: string | null;
      createdAt: string;
    }>
  >([]);
  const [isLoading, setIsLoading] = useState(true);

  const form = useForm<CreateUserInput>({
    resolver: zodResolver(createUserSchema),
    defaultValues: {
      email: '',
      firstName: '',
      lastName: '',
      role: 'employee',
      phone: '',
    },
  });

  const editForm = useForm<UpdateUserInput>({
    resolver: zodResolver(updateUserSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      role: 'employee',
      phone: '',
    },
  });

  // Load users
  useEffect(() => {
    const loadUsers = async () => {
      const result = await getUsers();

      if (!result.success || !result.data) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: result.error ?? 'Impossible de charger les utilisateurs',
        });
        setIsLoading(false);
        return;
      }

      setUsers(result.data);
      setIsLoading(false);
    };

    loadUsers();
  }, [toast]);

  const handleCreateUser = (data: CreateUserInput) => {
    startTransition(async () => {
      const result = await createUser(data);

      if (!result.success || !result.data) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: result.error ?? 'Impossible de créer l\'utilisateur',
        });
        return;
      }

      toast({
        variant: 'success',
        title: 'Utilisateur créé',
        description: 'Le compte a été créé avec succès',
      });

      // Save password for display
      setGeneratedPassword(result.data.temporaryPassword);

      // Close creation dialog and open password dialog
      setIsDialogOpen(false);
      setPasswordDialogOpen(true);

      // Reload users
      const usersResult = await getUsers();
      if (usersResult.success && usersResult.data) {
        setUsers(usersResult.data);
      }

      form.reset();
    });
  };

  const handleDeleteUser = async () => {
    if (!userToDelete) {
      return;
    }

    startTransition(async () => {
      const result = await deleteUser(userToDelete);

      if (!result.success) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: result.error ?? 'Impossible de désactiver l\'utilisateur',
        });
        return;
      }

      toast({
        variant: 'success',
        title: 'Utilisateur désactivé',
        description: 'L\'utilisateur a été désactivé avec succès',
      });

      // Reload users
      const usersResult = await getUsers();
      if (usersResult.success && usersResult.data) {
        setUsers(usersResult.data);
      }

      setIsAlertOpen(false);
      setUserToDelete(null);
    });
  };

  const handleOpenEditDialog = (userId: string) => {
    const user = users.find((u) => u.id === userId);
    if (!user) {
      return;
    }

    editForm.reset({
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role as 'admin' | 'manager' | 'employee' | 'viewer',
      phone: user.phone || '',
    });

    setUserToEdit(userId);
    setIsEditDialogOpen(true);
  };

  const handleEditUser = (data: UpdateUserInput) => {
    if (!userToEdit) {
      return;
    }

    startTransition(async () => {
      const result = await updateUser(userToEdit, data);

      if (!result.success) {
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: result.error ?? 'Impossible de modifier l\'utilisateur',
        });
        return;
      }

      toast({
        variant: 'success',
        title: 'Utilisateur modifié',
        description: 'Les modifications ont été enregistrées',
      });

      // Reload users
      const usersResult = await getUsers();
      if (usersResult.success && usersResult.data) {
        setUsers(usersResult.data);
      }

      setIsEditDialogOpen(false);
      setUserToEdit(null);
      editForm.reset();
    });
  };

  const copyPassword = () => {
    navigator.clipboard.writeText(generatedPassword);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  const getInitials = (firstName: string, lastName: string) => {
    return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) {
      return 'Jamais';
    }
    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(dateString));
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-[#F2E94E]" />
          <p className="text-sm text-white/70">Chargement...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-white">Équipe</h1>
          <p className="mt-2 text-white/70">
            Gérez les utilisateurs de votre entreprise
          </p>
        </div>
        <Button
          onClick={() => setIsDialogOpen(true)}
          className="rounded-2xl bg-[#F2E94E] text-[#0A1A2F] hover:bg-[#f6f07a]"
        >
          <UserPlus className="mr-2 h-4 w-4" />
          Nouvel utilisateur
        </Button>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-[24px] border border-white/15 bg-white/12 backdrop-blur-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Total</p>
                <p className="text-3xl font-semibold text-white">{users.length}</p>
              </div>
              <Shield className="h-8 w-8 text-[#F2E94E]" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border border-white/15 bg-white/12 backdrop-blur-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Actifs</p>
                <p className="text-3xl font-semibold text-green-400">
                  {users.filter((u) => u.isActive).length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-green-400" />
            </div>
          </CardContent>
        </Card>

        <Card className="rounded-[24px] border border-white/15 bg-white/12 backdrop-blur-2xl">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-white/70">Administrateurs</p>
                <p className="text-3xl font-semibold text-white">
                  {users.filter((u) => u.role === 'admin').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-white" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Users list */}
      <Card className="rounded-[32px] border border-white/15 bg-white/12 backdrop-blur-2xl">
        <CardHeader className="px-8 pt-8">
          <CardTitle className="text-white">Utilisateurs</CardTitle>
          <CardDescription className="text-white/65">
            Liste de tous les utilisateurs de votre entreprise
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 px-8 pb-8">
          {users.map((user) => (
            <div
              key={user.id}
              className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4 transition-colors hover:bg-white/10"
            >
              <div className="flex items-center gap-4">
                <Avatar className="h-12 w-12 border-2 border-white/20">
                  <AvatarFallback className="bg-[#F2E94E] text-[#0A1A2F]">
                    {getInitials(user.firstName, user.lastName)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-white">
                      {user.firstName} {user.lastName}
                    </p>
                    <Badge className={ROLE_COLORS[user.role]}>
                      {ROLE_LABELS[user.role]}
                    </Badge>
                    {!user.isActive && (
                      <Badge variant="destructive">Désactivé</Badge>
                    )}
                  </div>
                  <p className="text-sm text-white/70">{user.email}</p>
                  {user.phone && (
                    <p className="text-xs text-white/50">{user.phone}</p>
                  )}
                  <p className="mt-1 text-xs text-white/50">
                    Dernière connexion : {formatDate(user.lastLoginAt)}
                  </p>
                </div>
              </div>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => handleOpenEditDialog(user.id)}
                  >
                    <Edit className="mr-2 h-4 w-4" />
                    Modifier
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    <Mail className="mr-2 h-4 w-4" />
                    Envoyer un email
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-red-600"
                    onClick={() => {
                      setUserToDelete(user.id);
                      setIsAlertOpen(true);
                    }}
                  >
                    <UserMinus className="mr-2 h-4 w-4" />
                    Désactiver
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ))}

          {users.length === 0 && (
            <div className="py-12 text-center">
              <p className="text-white/50">Aucun utilisateur</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create user dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="rounded-[32px] border border-white/15 bg-[#0A1A2F] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-white">Nouvel utilisateur</DialogTitle>
            <DialogDescription className="text-white/65">
              Créez un nouveau compte utilisateur. Un mot de passe temporaire sera généré.
            </DialogDescription>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleCreateUser)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70">Prénom</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="rounded-2xl border-white/20 bg-white/20 text-white"
                          placeholder="Jean"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70">Nom</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="rounded-2xl border-white/20 bg-white/20 text-white"
                          placeholder="Dupont"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70">Email</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="email"
                        className="rounded-2xl border-white/20 bg-white/20 text-white"
                        placeholder="jean.dupont@entreprise.com"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70">Téléphone (optionnel)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="rounded-2xl border-white/20 bg-white/20 text-white"
                        placeholder="+33 6 12 34 56 78"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70">Rôle</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger className="rounded-2xl border-white/20 bg-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Administrateur</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="employee">Employé</SelectItem>
                        <SelectItem value="viewer">Observateur</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setIsDialogOpen(false)}
                  className="rounded-2xl text-white/70"
                  disabled={isPending}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="rounded-2xl bg-[#F2E94E] text-[#0A1A2F] hover:bg-[#f6f07a]"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Création...
                    </>
                  ) : (
                    <>
                      <Plus className="mr-2 h-4 w-4" />
                      Créer
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Edit user dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="rounded-[32px] border border-white/15 bg-[#0A1A2F] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-white">Modifier l&apos;utilisateur</DialogTitle>
            <DialogDescription className="text-white/65">
              Modifiez les informations de l&apos;utilisateur
            </DialogDescription>
          </DialogHeader>

          <Form {...editForm}>
            <form onSubmit={editForm.handleSubmit(handleEditUser)} className="space-y-4">
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={editForm.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70">Prénom</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="rounded-2xl border-white/20 bg-white/20 text-white"
                          placeholder="Jean"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={editForm.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-white/70">Nom</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          className="rounded-2xl border-white/20 bg-white/20 text-white"
                          placeholder="Dupont"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={editForm.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70">Téléphone (optionnel)</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        className="rounded-2xl border-white/20 bg-white/20 text-white"
                        placeholder="+33 6 12 34 56 78"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={editForm.control}
                name="role"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-white/70">Rôle</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || 'employee'} defaultValue={field.value || 'employee'}>
                      <FormControl>
                        <SelectTrigger className="rounded-2xl border-white/20 bg-white/20 text-white">
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="admin">Administrateur</SelectItem>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="employee">Employé</SelectItem>
                        <SelectItem value="viewer">Observateur</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setUserToEdit(null);
                  }}
                  className="rounded-2xl text-white/70"
                  disabled={isPending}
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={isPending}
                  className="rounded-2xl bg-[#F2E94E] text-[#0A1A2F] hover:bg-[#f6f07a]"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      Enregistrer
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Password display dialog */}
      <Dialog open={passwordDialogOpen} onOpenChange={setPasswordDialogOpen}>
        <DialogContent className="rounded-[32px] border border-white/15 bg-[#0A1A2F] sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle className="text-white">Mot de passe temporaire</DialogTitle>
            <DialogDescription className="text-white/65">
              Communiquez ce mot de passe à l&apos;utilisateur. Il devra le changer à sa première connexion.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="rounded-2xl border border-white/20 bg-white/10 p-4">
              <p className="mb-2 text-sm text-white/70">Mot de passe</p>
              <div className="flex items-center justify-between">
                <code className="text-lg font-mono text-[#F2E94E]">
                  {generatedPassword}
                </code>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={copyPassword}
                  className="text-white"
                >
                  {copiedPassword ? (
                    <Check className="h-4 w-4 text-green-400" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <p className="text-sm text-white/50">
              ⚠️ Ce mot de passe ne sera plus affiché. Assurez-vous de le copier maintenant.
            </p>
          </div>

          <DialogFooter>
            <Button
              onClick={() => {
                setPasswordDialogOpen(false);
                setGeneratedPassword('');
              }}
              className="rounded-2xl bg-[#F2E94E] text-[#0A1A2F] hover:bg-[#f6f07a]"
            >
              J&apos;ai copié le mot de passe
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete confirmation */}
      <AlertDialog open={isAlertOpen} onOpenChange={setIsAlertOpen}>
        <AlertDialogContent className="rounded-[32px] border border-white/15 bg-[#0A1A2F]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">
              Désactiver cet utilisateur ?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-white/65">
              L&apos;utilisateur ne pourra plus se connecter mais ses données seront conservées.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="rounded-2xl text-white/70">
              Annuler
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              disabled={isPending}
              className="rounded-2xl bg-red-600 text-white hover:bg-red-700"
            >
              {isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Désactivation...
                </>
              ) : (
                'Désactiver'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
