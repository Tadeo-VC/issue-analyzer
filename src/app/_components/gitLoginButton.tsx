"use client";
import { getSupabaseBrowserClient } from "../utils/supabase/browserClient";
import { Button } from "@chakra-ui/react";
import { FaGithub } from "react-icons/fa";

export default function GitHubLoginButton() {
    
    async function handleSupabaseGitHubLogin(event: React.MouseEvent<HTMLButtonElement>) {
        event.preventDefault();
        getSupabaseBrowserClient().auth.signInWithOAuth({
            provider: 'github',
            options: {
                redirectTo: 'https://issue-analyzer.vercel.app/chats',
                scopes: 'repo' 
            }
        })
    }
    
    return (
        <Button
          colorScheme="gray"
          size="lg"
          onClick={handleSupabaseGitHubLogin}
          _hover={{ bg: "gray.700", color: "white" }}
        >
          <FaGithub style={{ marginRight: 8 }} />
          Sign in with GitHub
        </Button>
    );
}