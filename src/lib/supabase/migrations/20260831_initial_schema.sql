-- Habilitar a extensão pgcrypto para geração de UUIDs
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles (Extensão da tabela nativa de autenticação auth.users)
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT NOT NULL,
  avatar_url TEXT,
  timezone TEXT DEFAULT 'America/Sao_Paulo',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Groups (Representa a união do casal)
CREATE TABLE groups (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Group Members (Conecta os profiles aos groups)
CREATE TABLE group_members (
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  PRIMARY KEY (group_id, profile_id)
);

-- 4. Challenges (O catálogo de desafios disponíveis)
CREATE TABLE challenges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  target_amount DECIMAL(10, 2) NOT NULL,
  start_value DECIMAL(10, 2) NOT NULL,
  end_value DECIMAL(10, 2) NOT NULL,
  increment_value DECIMAL(10, 2) NOT NULL DEFAULT 1,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- Insere automaticamente o Desafio dos 100 como o desafio padrão do sistema
INSERT INTO challenges (name, description, target_amount, start_value, end_value, increment_value) 
VALUES (
  'Desafio dos 100', 
  'Guarde R$1 no primeiro passo, R$2 no segundo, até R$100. Total de R$ 5.050.', 
  5050.00, 
  1.00, 
  100.00, 
  1.00
);

-- 5. User Challenges (O desafio ativo de um usuário específico)
CREATE TABLE user_challenges (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  challenge_id UUID REFERENCES challenges(id) ON DELETE CASCADE NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'abandoned')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  completed_at TIMESTAMP WITH TIME ZONE,
  UNIQUE(profile_id, challenge_id) -- Um usuário só pode ter um desafio ativo do mesmo tipo
);

-- 6. Deposits (O coração do sistema)
CREATE TABLE deposits (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_challenge_id UUID REFERENCES user_challenges(id) ON DELETE CASCADE NOT NULL,
  step_number INTEGER NOT NULL CHECK (step_number >= 1),
  amount DECIMAL(10, 2) NOT NULL CHECK (amount > 0),
  deposited_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  
  -- A TRAVA DE SEGURANÇA: Impede que o mesmo passo seja depositado duas vezes
  UNIQUE (user_challenge_id, step_number)
);

-- 7. Invites (Gerencia os links de convite para a parceira)
CREATE TABLE invites (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  group_id UUID REFERENCES groups(id) ON DELETE CASCADE NOT NULL,
  token TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  used BOOLEAN DEFAULT FALSE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 8. Telegram Connections (Para o Bot)
CREATE TABLE telegram_connections (
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  chat_id TEXT UNIQUE NOT NULL,
  connected_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 9. Notification Preferences (Configuração de alertas)
CREATE TABLE notification_preferences (
  profile_id UUID REFERENCES profiles(id) ON DELETE CASCADE PRIMARY KEY,
  is_active BOOLEAN DEFAULT TRUE NOT NULL,
  time_of_day TIME DEFAULT '20:00:00' NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);