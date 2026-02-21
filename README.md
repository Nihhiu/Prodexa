# 📱 Prodexa - App Mobile

Aplicação mobile nativa para Android e iOS, desenvolvida com **React Native**, **Expo** e **NativeWind** (Tailwind CSS).

## 🚀 Início Rápido

### Pré-requisitos
- Node.js 18+
- npm ou yarn
- Expo CLI: `npm install -g expo-cli`
- Para iOS: Xcode (macOS)
- Para Android: Android Studio + JDK

### Instalação

```bash
# Instalar dependências
npm install

# Ou com yarn
yarn install
```

### Executar a App

```bash
# Desenvolvimento (exibe QR code)
npm start

# Android
npm run android

# iOS (apenas macOS)
npm run ios

# Web
npm run web
```

## 📂 Estrutura do Projeto

A estrutura está organizada para máxima escalabilidade e manutenibilidade:

```
src/
├── components/      # Componentes reutilizáveis (UI, Layout, Common)
├── screens/        # Telas da aplicação
├── features/       # Features modulares (auth, profile, etc.)
├── hooks/          # Custom hooks
├── navigation/     # Configuração de rotas
├── context/        # React Context
├── api/            # Requisições HTTP
├── state/          # Gerenciamento de estado
├── lib/            # Utilitários e helpers
├── config/         # Configurações
├── types/          # TypeScript types
├── utils/          # Funções genéricas
├── constants/      # Constantes da app
├── styles/         # Estilos globais
├── assets/         # Imagens, ícones, fontes
└── testing/        # Testes e mocks
```

👉 Veja [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) para documentação completa da estrutura.

## 🎨 Tecnologias

| Tecnologia | Versão | Descrição |
|-----------|--------|-----------|
| React Native | 0.81.5 | Framework mobile |
| Expo | 54.0.0 | Plataforma React Native |
| NativeWind | latest | Tailwind CSS para mobile |
| TypeScript | 5.9.2 | Tipagem estática |
| React | 19.1.0 | Biblioteca UI |
| Tailwind CSS | 3.4.0 | Estilização |
| ESLint | 9.25.1 | Linting |
| Prettier | 3.2.5 | Formatação |

## 📋 Scripts Disponíveis

```bash
# Desenvolvimento
npm start              # Inicia servidor Expo
npm run android        # Executa no Android
npm run ios           # Executa no iOS
npm run web           # Executa no navegador

# Qualidade de código
npm run lint          # Verifica ESLint + Prettier
npm run format        # Corrige erros e formata código

# Build
npm run prebuild      # Prepara para build nativo
```

## 🔧 Configuração

### Path Aliases

O projeto usa path aliases para importações limpas:

```typescript
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks';
import { validators } from '@/lib/validators';
```

Configurado em `tsconfig.json`.

### NativeWind / Tailwind

Estilos usando classes Tailwind:

```tsx
<View className="flex-1 items-center justify-center bg-white">
  <Text className="text-lg font-bold text-gray-900">Hello World</Text>
</View>
```

## 📚 Documentação

- [PROJECT_STRUCTURE.md](./PROJECT_STRUCTURE.md) - Estrutura detalhada de pastas
- [docs/CONVENTIONS.md](./docs/CONVENTIONS.md) - Convenções de código
- [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md) - Arquitetura da app
- [docs/SETUP.md](./docs/SETUP.md) - Guia de setup (em breve)
- [docs/API.md](./docs/API.md) - Documentação de APIs (em breve)

## 🧪 Testes

```bash
# Executar testes
npm test

# Com cobertura
npm test -- --coverage

# Watch mode
npm test -- --watch
```

## 🌐 Variáveis de Ambiente

Crie um arquivo `.env.local`:

```env
EXPO_PUBLIC_API_URL=http://localhost:3000
EXPO_PUBLIC_DEBUG=true
```

As variáveis com prefixo `EXPO_PUBLIC_` estarão disponíveis no app.

## 📱 Suportes de Plataforma

- ✅ iOS 13.0+
- ✅ Android 5.0+ (API 21)
- ✅ Web (experimental)

## 🤝 Contribuindo

1. Crie uma branch: `git checkout -b feature/sua-feature`
2. Faça suas mudanças
3. Siga as [CONVENTIONS.md](./docs/CONVENTIONS.md)
4. Faça commit: `git commit -m 'Add feature'`
5. Push: `git push origin feature/sua-feature`
6. Abra um Pull Request

## 📝 Convenções

Leia [docs/CONVENTIONS.md](./docs/CONVENTIONS.md) para:
- Padrões de nomenclatura
- Estrutura de componentes
- Organização de imports
- Tipos TypeScript
- Tratamento de erros

## 🐛 Troubleshooting

### Erro: "Metro has encountered an error"
```bash
# Limpar cache
expo start -c

# Ou
npm start -- -c
```

### Problemas com dependências
```bash
# Limpar node_modules
rm -rf node_modules
npm install

# Ou resetar Expo
expo start --clear
```

### NativeWind não carrega estilos
```bash
# Reconstruir aplicação
npm run prebuild
```

## 📞 Suporte

Para dúvidas ou problemas:
1. Verifique a [documentação do Expo](https://docs.expo.dev)
2. Consulte [NativeWind docs](https://www.nativewind.dev)
3. Abra uma issue no repositório

## 📄 Licença

Este projeto está sob a licença MIT. Veja [LICENSE](./LICENSE) para detalhes.

## 🎯 Roadmap

- [ ] Setup de navigação (React Navigation / Expo Router)
- [ ] Gerenciamento de estado (Zustand / Jotai)
- [ ] Autenticação com JWT
- [ ] Testes unitários
- [ ] CI/CD (GitHub Actions)
- [ ] Build & Deploy (EAS)

---

**Desenvolvido com ❤️ usando React Native + Expo + NativeWind**
