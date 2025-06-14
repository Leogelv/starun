"use client"
import { CatalogPage } from './CatalogPage';
import { BottomNavigation } from '@/fsd/shared/components/BottomNavigation';

export const MainPage = () => {
    return (
        <div className="min-h-screen pb-16">
            <CatalogPage />
            <BottomNavigation />
        </div>
    );
}