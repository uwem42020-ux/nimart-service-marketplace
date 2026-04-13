// src/components/common/Footer.tsx
export function Footer() {
  return (
    <footer className="bg-gray-900 text-white py-8 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center text-sm text-gray-400">
          © {new Date().getFullYear()} Nimart. All rights reserved.
        </div>
      </div>
    </footer>
  );
}