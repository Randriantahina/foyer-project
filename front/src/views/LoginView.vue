<script setup lang="ts">
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
</script>

<template>
  <div class="min-h-screen bg-white flex items-center justify-center p-4">
    <div class="w-full max-w-sm">
      <!-- Title -->
      <div class="mb-8">
        <h1 class="text-3xl font-bold text-indigo-600 mb-1">Bienvenue</h1>
        <p class="text-gray-400 text-sm">Connectez-vous à votre compte</p>
      </div>

      <!-- Form -->
      <div class="space-y-4">
        <!-- Email -->
        <div class="space-y-1.5">
          <Label for="email" class="text-sm font-semibold text-gray-600">Email</Label>
          <Input
            id="email"
            type="email"
            placeholder="vous@exemple.com"
            class="h-11 rounded-lg border-gray-200 bg-gray-50 text-gray-800 placeholder:text-gray-400 focus-visible:ring-indigo-400/30 focus-visible:border-indigo-400"
          />
        </div>

        <!-- Password -->
        <div class="space-y-1.5">
          <div class="flex items-center justify-between">
            <Label for="password" class="text-sm font-semibold text-gray-600">Mot de passe</Label>
            <a href="#" class="text-xs text-indigo-500 hover:text-indigo-600 transition-colors">
              Mot de passe oublié ?
            </a>
          </div>
          <Input
            id="password"
            type="password"
            placeholder="••••••••"
            class="h-11 rounded-lg border-gray-200 bg-gray-50 text-gray-800 placeholder:text-gray-400 focus-visible:ring-indigo-400/30 focus-visible:border-indigo-400"
          />
        </div>

        <!-- Submit -->
        <Button
          class="w-full h-11 rounded-lg font-semibold bg-indigo-600 hover:bg-indigo-700 text-white border-0 transition-colors mt-2"
        >
          Se connecter
        </Button>

        <!-- Register -->
        <p class="text-center text-sm text-gray-400">
          Pas encore de compte ?
          <a
            href="/register"
            class="text-indigo-500 hover:text-indigo-600 font-semibold transition-colors ml-1"
          >
            Créer un compte
          </a>
        </p>
      </div>
    </div>
  </div>
</template>
