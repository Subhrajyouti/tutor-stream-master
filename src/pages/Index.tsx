import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, PlusCircle, BarChart3 } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-4xl space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-5xl font-bold text-primary">
            Expense Tracker
          </h1>
          <p className="text-xl text-muted-foreground">
            Simple, secure expense tracking with AI-powered insights
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Wallet className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Track Expenses</CardTitle>
              <CardDescription>
                Add expenses via text or voice with AI parsing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/add-expense">
                <Button className="w-full">
                  <PlusCircle className="mr-2 h-4 w-4" />
                  Add Expense
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <BarChart3 className="h-12 w-12 text-primary mb-4" />
              <CardTitle>View Dashboard</CardTitle>
              <CardDescription>
                Live insights with charts and analytics
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/dashboard">
                <Button className="w-full" variant="secondary">
                  View Dashboard
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <Wallet className="h-12 w-12 text-primary mb-4" />
              <CardTitle>Get Started</CardTitle>
              <CardDescription>
                Sign up to start tracking your expenses
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Link to="/auth">
                <Button className="w-full" variant="outline">
                  Sign In / Sign Up
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>

        <Card className="bg-muted">
          <CardHeader>
            <CardTitle className="text-center">Features</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Email authentication with secure backend</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>AI-powered expense parsing from text/voice</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Live dashboard with real-time updates</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">✓</span>
                <span>Beautiful charts and category breakdowns</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Index;
