'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

import StepIndicator from './_components/StepIndicator';
import SignupForm from './_components/SignupForm';
import ChoosePlan from './_components/ChoosePlan';
import StripeRedirect from './_components/StripeRedirect';

type Step = 'signup' | 'plan' | 'pay';

export default function SignupPage() {
  const [step, setStep] = useState<Step>('signup');
  const [selectedPlan, setSelectedPlan] = useState<{
    name: string;
    billingCycle: 'monthly' | 'yearly';
  } | null>(null);

  return (
    <main className="min-h-screen bg-[#fffdf7] flex flex-col items-center justify-center px-6 py-16">
      <StepIndicator step={step} />

      <div className="w-full mt-12">
        <AnimatePresence mode="wait">
          {step === 'signup' && (
            <motion.div
              key="signup"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <SignupForm onSuccess={() => setStep('plan')} />
            </motion.div>
          )}

          {step === 'plan' && (
            <motion.div
              key="plan"
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -30 }}
              transition={{ duration: 0.35, ease: 'easeOut' }}
            >
              <ChoosePlan
                onSelectPlan={(plan) => {
                  setSelectedPlan(plan);
                  setStep('pay');
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* 🚨 MUST BE OUTSIDE AnimatePresence */}
        {step === 'pay' && selectedPlan && (
          <StripeRedirect plan={selectedPlan} />
        )}
      </div>
    </main>
  );
}

