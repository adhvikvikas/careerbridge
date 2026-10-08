import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';
import { SearchX, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-base p-6 text-center">
      <div className="w-20 h-20 bg-surface border border-border-light text-content-muted rounded-2xl flex items-center justify-center mb-6 shadow-sm">
        <SearchX className="w-10 h-10" />
      </div>
      <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-content mb-4">
        Page Not Found
      </h1>
      <p className="text-lg font-medium text-content-muted max-w-md mx-auto mb-8 leading-relaxed">
        We couldn't find the page you're looking for. It might have been removed, renamed, or didn't exist in the first place.
      </p>
      <Button 
        variant="primary" 
        size="lg" 
        onClick={() => navigate(-1)}
        icon={<ArrowLeft className="w-5 h-5" />}
      >
        Go Back
      </Button>
    </div>
  );
}
