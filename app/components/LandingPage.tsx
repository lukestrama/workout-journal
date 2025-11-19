import { Button } from "@/components/ui/button";
import Link from "next/link";

const LandingPage = () => {
  return (
    <main className="min-h-full">
      <section className="hero-gradient px-5 h-screen flex justify-center items-center">
        <div className="max-w-6xl mx-auto text-center">
          <h1
            id="main-heading"
            className="text-primary text-5xl md:text-6xl font-bold mb-6"
          >
            Track Every Rep, Every Set, Every Win
          </h1>
          <p
            id="subheading"
            className="text-xl md:text-2xl mb-8 text-primary-foreground"
          >
            A minimalist workout tracker that helps you log exercises and
            visualize your progress
          </p>
          <Button asChild>
            <Link href="/sign-in">Start Tracking Free</Link>
          </Button>
        </div>
      </section>
      <section className="py-20 px-6 bg-primary-foreground">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-primary-foreground">
            Why Choose Our Program
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="card-hover bg-white rounded-xl p-8 shadow-lg">
              <div className="text-5xl mb-4">✏️</div>
              <h3
                id="feature-1-title"
                className="text-2xl font-bold mb-3 text-gray-800"
              >
                Log Workouts
              </h3>
              <p id="feature-1-desc" className="text-gray-600">
                Quickly add exercises with sets, reps, and weight in a clean,
                distraction-free interface
              </p>
            </div>
            <div className="card-hover bg-white rounded-xl p-8 shadow-lg">
              <div className="text-5xl mb-4">📊</div>
              <h3
                id="feature-2-title"
                className="text-2xl font-bold mb-3 text-gray-800"
              >
                Visualize Progress
              </h3>
              <p id="feature-2-desc" className="text-gray-600">
                See your strength gains over time with simple charts and
                progress tracking
              </p>
            </div>
            <div className="card-hover bg-white rounded-xl p-8 shadow-lg">
              <div className="text-5xl mb-4">⚡</div>
              <h3
                id="feature-3-title"
                className="text-2xl font-bold mb-3 text-gray-800"
              >
                Stay Minimal
              </h3>
              <p id="feature-3-desc" className="text-gray-600">
                Focus on what matters with a simple, intuitive design that stays
                out of your way
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <h2 className="text-4xl font-bold text-center mb-16 text-gray-800">
            See It In Action
          </h2>
          <div className="grid md:grid-cols-2 gap-12">
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-2xl p-8 aspect-[4/3] flex items-center justify-center shadow-lg">
                <div className="text-center">
                  <div className="text-6xl mb-4">📱</div>
                  <p className="text-gray-500 text-lg">Screenshot 1</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Add your screenshot here
                  </p>
                </div>
              </div>
              <p
                id="screenshot-1-caption"
                className="text-center text-gray-600 text-lg"
              >
                Log exercises with a clean, minimal interface
              </p>
            </div>
            <div className="space-y-4">
              <div className="bg-gray-100 rounded-2xl p-8 aspect-[4/3] flex items-center justify-center shadow-lg">
                <div className="text-center">
                  <div className="text-6xl mb-4">📈</div>
                  <p className="text-gray-500 text-lg">Screenshot 2</p>
                  <p className="text-gray-400 text-sm mt-2">
                    Add your screenshot here
                  </p>
                </div>
              </div>
              <p
                id="screenshot-2-caption"
                className="text-center text-gray-600 text-lg"
              >
                Visualize your progress over time
              </p>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 px-6 bg-primary-background text-white">
        <div className="max-w-6xl mx-auto">
          <div className="grid md:grid-cols-3 gap-8 text-center">
            <div>
              <div className="text-5xl font-bold mb-2 text-primary">Simple</div>
              <div className="text-xl opacity-90">Add Exercise in Seconds</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2 text-primary">Clear</div>
              <div className="text-xl opacity-90">Track Your Numbers</div>
            </div>
            <div>
              <div className="text-5xl font-bold mb-2 text-primary">Focus</div>
              <div className="text-xl opacity-90">Minimal Distractions</div>
            </div>
          </div>
        </div>
      </section>
      <section className="py-20 px-6 bg-primary-background">
        <div className="max-w-4xl mx-auto text-center">
          <h2
            id="cta-heading"
            className="text-4xl md:text-5xl font-bold mb-6 text-primary-foreground"
          >
            Start Tracking Today
          </h2>
          <p
            id="cta-description"
            className="text-xl mb-8 text-primary-foreground"
          >
            Simple workout logging. Clear progress tracking. Zero clutter.
            Everything you need, nothing you don&apos;t.
          </p>
          <Button asChild>
            <Link href="/sign-in">Start Tracking Free</Link>
          </Button>
        </div>
      </section>
    </main>
  );
};

export default LandingPage;
