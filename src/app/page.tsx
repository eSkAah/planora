import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

export default function Home() {
  return (
    <div className='bg-background min-h-screen p-8'>
      <div className='mx-auto max-w-6xl space-y-8'>
        {/* Header */}
        <header className='space-y-4 text-center'>
          <h1 className='text-foreground text-4xl font-bold'>🗓️ Planora</h1>
          <p className='text-muted-foreground text-xl'>
            Application SaaS de Gestion des Plannings avec IA
          </p>
        </header>

        {/* Theme Demo Section */}
        <section className='space-y-6'>
          <h2 className='text-foreground text-2xl font-semibold'>
            Démonstration du Thème Personnalisé
          </h2>

          <div className='grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3'>
            {/* Primary Colors Card */}
            <Card>
              <CardHeader>
                <CardTitle className='text-primary'>
                  Couleurs Primaires
                </CardTitle>
                <CardDescription>
                  Bleu professionnel pour l&apos;identité Planora
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <Button className='w-full'>Bouton Primaire</Button>
                <Button variant='outline' className='w-full'>
                  Bouton Outline
                </Button>
              </CardContent>
            </Card>

            {/* Accent Colors Card */}
            <Card>
              <CardHeader>
                <CardTitle className='text-accent-foreground bg-accent rounded px-3 py-1'>
                  Couleurs d&apos;Accent
                </CardTitle>
                <CardDescription>
                  Orange énergique pour les éléments interactifs
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <Button
                  variant='secondary'
                  className='bg-accent text-accent-foreground hover:bg-accent/90 w-full'
                >
                  Call-to-Action
                </Button>
                <div className='bg-accent h-4 rounded-full'></div>
              </CardContent>
            </Card>

            {/* Form Elements Card */}
            <Card>
              <CardHeader>
                <CardTitle>Éléments de Formulaire</CardTitle>
                <CardDescription>
                  Champs optimisés pour la saisie de données
                </CardDescription>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor='demo-input'>Nom du projet</Label>
                  <Input id='demo-input' placeholder='Entrez le nom...' />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='demo-textarea'>Description</Label>
                  <Textarea
                    id='demo-textarea'
                    placeholder='Décrivez votre planning...'
                    rows={3}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Color Palette Display */}
          <Card>
            <CardHeader>
              <CardTitle>Palette de Couleurs Planora</CardTitle>
              <CardDescription>
                Thème professionnel optimisé pour la productivité et
                l&apos;organisation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-2 gap-4 md:grid-cols-4'>
                <div className='space-y-2'>
                  <div className='bg-primary h-16 rounded-lg border'></div>
                  <p className='text-sm font-medium'>Primary</p>
                  <p className='text-muted-foreground text-xs'>
                    Bleu professionnel
                  </p>
                </div>
                <div className='space-y-2'>
                  <div className='bg-accent h-16 rounded-lg border'></div>
                  <p className='text-sm font-medium'>Accent</p>
                  <p className='text-muted-foreground text-xs'>
                    Orange énergique
                  </p>
                </div>
                <div className='space-y-2'>
                  <div className='bg-secondary h-16 rounded-lg border'></div>
                  <p className='text-sm font-medium'>Secondary</p>
                  <p className='text-muted-foreground text-xs'>Gris clair</p>
                </div>
                <div className='space-y-2'>
                  <div className='bg-muted h-16 rounded-lg border'></div>
                  <p className='text-sm font-medium'>Muted</p>
                  <p className='text-muted-foreground text-xs'>
                    Arrière-plan neutre
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Features Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Fonctionnalités à Venir</CardTitle>
              <CardDescription>
                Aperçu des fonctionnalités de gestion de planning
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className='grid grid-cols-1 gap-4 md:grid-cols-3'>
                <div className='hover:bg-muted/50 rounded-lg border p-4 transition-colors'>
                  <h3 className='mb-2 font-semibold'>
                    📅 Planning Intelligent
                  </h3>
                  <p className='text-muted-foreground text-sm'>
                    Génération automatique de plannings avec IA
                  </p>
                </div>
                <div className='hover:bg-muted/50 rounded-lg border p-4 transition-colors'>
                  <h3 className='mb-2 font-semibold'>👥 Multi-tenant</h3>
                  <p className='text-muted-foreground text-sm'>
                    Gestion sécurisée pour plusieurs organisations
                  </p>
                </div>
                <div className='hover:bg-muted/50 rounded-lg border p-4 transition-colors'>
                  <h3 className='mb-2 font-semibold'>📊 Analytics</h3>
                  <p className='text-muted-foreground text-sm'>
                    Tableaux de bord et rapports détaillés
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Footer */}
        <footer className='text-muted-foreground text-center'>
          <p>T004 - ShadCN/UI avec thème personnalisé Planora ✨</p>
        </footer>
      </div>
    </div>
  );
}
