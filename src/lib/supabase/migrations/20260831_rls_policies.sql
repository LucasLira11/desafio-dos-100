-- 1. Habilitar RLS em TODAS as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE invites ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- 2. Função auxiliar de segurança (Security Definer executa com privilégios de admin para verificar a relação)
CREATE OR REPLACE FUNCTION shares_group_with(target_profile_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM group_members gm1
    JOIN group_members gm2 ON gm1.group_id = gm2.group_id
    WHERE gm1.profile_id = auth.uid()
    AND gm2.profile_id = target_profile_id
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Políticas para Profiles
-- Pode criar o próprio perfil no momento do cadastro
CREATE POLICY "Inserir próprio perfil" ON profiles
  FOR INSERT WITH CHECK (auth.uid() = id);
-- Pode ver o próprio perfil ou o perfil de quem está no mesmo grupo (parceira)
CREATE POLICY "Ver próprio perfil ou parceiro" ON profiles
  FOR SELECT USING (auth.uid() = id OR shares_group_with(id));
-- Só pode atualizar o próprio perfil (nome, foto)
CREATE POLICY "Atualizar próprio perfil" ON profiles
  FOR UPDATE USING (auth.uid() = id);

-- 4. Políticas para Groups
CREATE POLICY "Ver próprios grupos" ON groups
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members WHERE group_id = groups.id AND profile_id = auth.uid()
    )
  );

-- 5. Políticas para Group Members
CREATE POLICY "Ver membros do grupo" ON group_members
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members gm WHERE gm.group_id = group_members.group_id AND gm.profile_id = auth.uid()
    )
  );

-- 6. Políticas para Challenges (Catálogo)
-- O catálogo de desafios é "público" para qualquer usuário logado na plataforma
CREATE POLICY "Catálogo de desafios público" ON challenges
  FOR SELECT TO authenticated USING (true);

-- 7. Políticas para User Challenges (A inscrição no desafio)
CREATE POLICY "Inserir próprio desafio" ON user_challenges
  FOR INSERT WITH CHECK (auth.uid() = profile_id);
CREATE POLICY "Ver desafio próprio ou do parceiro" ON user_challenges
  FOR SELECT USING (auth.uid() = profile_id OR shares_group_with(profile_id));
CREATE POLICY "Atualizar próprio desafio" ON user_challenges
  FOR UPDATE USING (auth.uid() = profile_id);

-- 8. Políticas para Deposits (O núcleo de segurança do dinheiro)
-- LER: Você pode ler os seus depósitos e os da sua parceira para gerar os gráficos
CREATE POLICY "Ver depósitos próprios ou do parceiro" ON deposits
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_challenges uc 
      WHERE uc.id = deposits.user_challenge_id 
      AND (uc.profile_id = auth.uid() OR shares_group_with(uc.profile_id))
    )
  );
-- INSERIR: Você SÓ pode marcar um depósito se ele pertencer ao SEU desafio
CREATE POLICY "Inserir próprios depósitos" ON deposits
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_challenges uc 
      WHERE uc.id = deposits.user_challenge_id AND uc.profile_id = auth.uid()
    )
  );
-- ATUALIZAR: Mesma regra
CREATE POLICY "Atualizar próprios depósitos" ON deposits
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM user_challenges uc 
      WHERE uc.id = deposits.user_challenge_id AND uc.profile_id = auth.uid()
    )
  );
-- DELETAR (Desfazer depósito): Mesma regra
CREATE POLICY "Deletar próprios depósitos" ON deposits
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM user_challenges uc 
      WHERE uc.id = deposits.user_challenge_id AND uc.profile_id = auth.uid()
    )
  );

-- 9. Políticas para Convites (Invites)
CREATE POLICY "Ver convites do próprio grupo" ON invites
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM group_members WHERE group_id = invites.group_id AND profile_id = auth.uid()
    )
  );

-- 10. Políticas de Notificações e Telegram
-- Apenas o dono pode gerenciar suas notificações
CREATE POLICY "Gerenciar notificacoes" ON notification_preferences
  FOR ALL USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);

CREATE POLICY "Gerenciar telegram" ON telegram_connections
  FOR ALL USING (auth.uid() = profile_id) WITH CHECK (auth.uid() = profile_id);