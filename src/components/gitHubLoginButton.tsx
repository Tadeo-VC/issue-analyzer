"use client";
import Image from "next/image"; 
import { getSupabaseBrowserClient } from "../utils/supabase/browserClient";

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
        <button className="bg-gray-800 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleSupabaseGitHubLogin}>
          Sign in with GitHub
          <Image src="https://github.githubassets.com/favicons/favicon.svg" alt="GitHub icon" width={16} height={16} />
        </button>
    );
}