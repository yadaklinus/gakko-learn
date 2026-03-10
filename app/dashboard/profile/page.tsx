"use client"
import React, { useState, useEffect, useCallback } from 'react';
import { signOut, useSession } from 'next-auth/react';
import { Settings, LogOut, Shield, CreditCard, Award, HelpCircle, Edit3, Globe, Save, X, Repeat } from 'lucide-react';
import TutorApplicationModal from '@/components/ToutorApplication';
import { Card, CardBody, CardHeader, CardFooter } from "@heroui/card";
import { Avatar } from "@heroui/avatar";
import { Button } from "@heroui/button";
import { Input, Textarea } from "@heroui/input";
import { Chip } from "@heroui/chip";
import { Listbox, ListboxItem } from "@heroui/listbox";
import { motion, AnimatePresence } from 'framer-motion';

// Enum matches Prisma
enum UserRole {
  STUDENT = "STUDENT",
  TUTOR = "TUTOR",
  BOTH = "BOTH"
}

enum CurrentUserRole {
  STUDENT = "STUDENT",
  TUTOR = "TUTOR",
  BOTH = "BOTH"
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  image: string | null;
  role: UserRole;
  currentRole: CurrentUserRole;
  institution: string | null;
  major: string | null;
  bio: string | null;
  hourlyRate: number | null;
  subjects: string | null;
}

export default function ProfileView() {
  const { data: session, update: updateSession } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  // Widget State
  const [isApplicationOpen, setIsApplicationOpen] = useState(false);
  console.log(session)
  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<Partial<UserProfile>>({});
  const [isSaving, setIsSaving] = useState(false);
  const [isSwitchingRole, setIsSwitchingRole] = useState(false);

  // Fetch Logic
  const fetchProfile = useCallback(async () => {
    if (!session?.user?.email) return;
    try {
      const res = await fetch('/api/users/me');
      if (res.ok) {
        const data = await res.json();
        const userData = data.user || data;
        setUser(userData);
        setFormData(userData);
      }
    } catch (error) {
      console.error("Failed to load profile", error);
    } finally {
      setIsLoading(false);
    }
  }, [session]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setIsEditing(false);
        updateSession({ role: data.user.role });
      }
    } catch (error) {
      console.error("Failed to update", error);
      alert("Failed to save changes.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleRoleSwitch = async () => {
    if (!user) return;
    setIsSwitchingRole(true);

    const targetRole = session?.user?.currentRole === "TUTOR" ? "STUDENT" : "TUTOR";

    try {
      const res = await fetch('/api/users/me', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentRole: targetRole })
      });

      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        await updateSession({ role: "BOTH", currentRole: targetRole });
      }
    } catch (error) {
      console.error("Failed to switch role", error);
      alert("Failed to switch role. Please try again.");
    } finally {
      setIsSwitchingRole(false);
    }
  };

  const handleApplicationSuccess = async () => {
    await fetchProfile();
    await updateSession({ role: "BOTH", currentRole: "TUTOR" });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }

  if (!user) return null;

  const menuItems = [
    { key: "verification", icon: <Shield size={20} className="text-success" />, label: 'Verification Center' },
    { key: "payments", icon: <CreditCard size={20} className="text-secondary" />, label: 'Payments & Earnings' },
    { key: "badges", icon: <Award size={20} className="text-warning" />, label: 'Badges & Achievements' },
    { key: "support", icon: <HelpCircle size={20} className="text-default-500" />, label: 'Support & Help' },
  ];

  return (
    <div className="pb-24 max-w-4xl mx-auto">
      {/* HEADER / BANNER */}
      <Card className="rounded-b-[40px] rounded-t-none bg-gradient-to-br from-primary-600 to-primary-800 shadow-xl border-none" shadow="none">
        <div className="absolute top-[-20px] right-[-20px] w-40 h-40 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-[-50px] left-[-30px] w-60 h-60 bg-black/10 rounded-full blur-2xl"></div>
        <CardBody className="pt-12 pb-8 px-6 relative z-10 overflow-visible">
          <div className="flex items-center space-x-5">
            <div className="relative">
              <Avatar
                src={user.image || `https://ui-avatars.com/api/?name=${user.name}&background=random`}
                className="w-24 h-24 text-large border-4 border-white/20 shadow-lg"
                isBordered
                color="primary"
              />
              {!isEditing && (
                <Button
                  isIconOnly
                  size="sm"
                  radius="full"
                  className="absolute bottom-0 right-0 z-20 bg-white text-primary-600 shadow-md"
                  onPress={() => setIsEditing(true)}
                >
                  <Edit3 size={14} />
                </Button>
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-white text-2xl font-bold tracking-tight">{user.name}</h2>
              <p className="text-primary-100 text-sm opacity-90 font-medium mt-1">
                {user.major || 'No Major'} • {user.institution || 'No Institution'}
              </p>
              <div className="flex items-center mt-3">
                <Chip size="sm" variant="flat" classNames={{ base: "bg-white/20", content: "text-white font-semibold tracking-wider uppercase drop-shadow-sm" }}>
                  {session?.user?.currentRole}
                </Chip>
              </div>
            </div>
            <Button isIconOnly variant="light" className="text-white hidden sm:flex">
              <Settings size={24} />
            </Button>
          </div>
        </CardBody>
      </Card>

      <div className="px-5 sm:px-8 -mt-6 relative z-20 space-y-6">

        {/* EDIT FORM */}
        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              <Card className="shadow-2xl border border-default-100">
                <CardHeader className="flex gap-3 justify-between px-6 pt-6 pb-2">
                  <div className="flex flex-col">
                    <p className="text-lg font-bold text-foreground">Edit Profile</p>
                    <p className="text-small text-default-500">Update your personal information</p>
                  </div>
                  <Button isIconOnly variant="light" onPress={() => setIsEditing(false)}>
                    <X size={20} className="text-default-400" />
                  </Button>
                </CardHeader>
                <CardBody className="space-y-4 px-6 py-4">
                  <Input
                    label="Full Name"
                    variant="bordered"
                    value={formData.name || ''}
                    onValueChange={(val: any) => setFormData({ ...formData, name: val })}
                    classNames={{ label: "font-semibold" }}
                  />
                  <div className="flex gap-4">
                    <Input
                      label="Institution"
                      variant="bordered"
                      value={formData.institution || ''}
                      onValueChange={(val: any) => setFormData({ ...formData, institution: val })}
                      className="flex-1"
                      classNames={{ label: "font-semibold" }}
                    />
                    <Input
                      label="Major"
                      variant="bordered"
                      value={formData.major || ''}
                      onValueChange={(val: any) => setFormData({ ...formData, major: val })}
                      className="flex-1"
                      classNames={{ label: "font-semibold" }}
                    />
                  </div>
                  <Textarea
                    label="Bio"
                    variant="bordered"
                    value={formData.bio || ''}
                    onValueChange={(val: any) => setFormData({ ...formData, bio: val })}
                    minRows={3}
                    classNames={{ label: "font-semibold" }}
                  />
                </CardBody>
                <CardFooter className="px-6 pb-6 pt-2">
                  <Button
                    color="primary"
                    className="w-full font-bold shadow-md"
                    isLoading={isSaving}
                    onPress={handleSave}
                    startContent={!isSaving && <Save size={18} />}
                  >
                    Save Changes
                  </Button>
                </CardFooter>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ROLE SWITCH BUTTON */}
        {session?.user.role === "BOTH" &&
          <Card
            isPressable
            onPress={handleRoleSwitch}
            isDisabled={isSwitchingRole}
            className="w-full bg-content1 border border-default-200 shadow-sm hover:border-primary-300 transition-colors"
          >
            <CardBody className="flex-row items-center justify-between p-5">
              <div className="flex items-center space-x-5">
                <div className={`p-3 rounded-2xl ${user.role === UserRole.TUTOR ? 'bg-warning-100 text-warning-600' : 'bg-primary-100 text-primary-600'}`}>
                  <Repeat size={24} />
                </div>
                <div className="text-left flex flex-col gap-1">
                  <h3 className="font-bold text-foreground text-base">
                    Switch to {session?.user?.currentRole === "TUTOR" ? "STUDENT" : "TUTOR"} View
                  </h3>
                  <p className="text-sm text-default-500">
                    {user.role === UserRole.TUTOR
                      ? 'View marketplace as a student'
                      : 'Manage your tutor profile'}
                  </p>
                </div>
              </div>
              {isSwitchingRole ? (
                <div className="h-5 w-5 border-2 border-primary-600 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <div className="text-default-300">
                  {/* Replace literal ChevronRight with SVG standard approach if needed, keeping lucide here as it's fine */}
                </div>
              )}
            </CardBody>
          </Card>
        }

        {/* BECOME A TUTOR CTA */}
        {user.role === UserRole.STUDENT && (
          <Card className="bg-gradient-to-r from-secondary-500 to-primary-600 shadow-lg border-none text-white">
            <CardBody className="flex-row items-center justify-between p-6">
              <div className="flex items-center space-x-5">
                <div className="bg-white/20 p-3 rounded-2xl backdrop-blur-md">
                  <Globe size={28} className="text-white" />
                </div>
                <div className="flex flex-col gap-1">
                  <h3 className="font-bold text-lg font-heading">New Application?</h3>
                  <p className="text-sm text-white/80 font-medium">Apply to become a tutor and share your knowledge.</p>
                </div>
              </div>
              <Button
                color="default"
                variant="solid"
                className="bg-white text-primary-600 font-bold shadow-md"
                onPress={() => setIsApplicationOpen(true)}
              >
                Apply Now
              </Button>
            </CardBody>
          </Card>
        )}

        {/* TUTOR STATS */}
        {session?.user?.currentRole === "TUTOR" && (
          <div className="grid grid-cols-2 gap-4">
            <Card className="shadow-sm border border-default-100">
              <CardBody className="p-5">
                <p className="text-xs text-default-400 font-bold uppercase tracking-wider mb-2">Hourly Rate</p>
                <p className="text-3xl font-black text-foreground">₦{user.hourlyRate || 0}</p>
              </CardBody>
            </Card>
            <Card className="shadow-sm border border-default-100">
              <CardBody className="p-5">
                <p className="text-xs text-default-400 font-bold uppercase tracking-wider mb-2">Subjects</p>
                <div className="flex flex-wrap gap-2 mt-1">
                  {user.subjects ? (
                    <Chip color="primary" variant="flat" size="sm" className="font-semibold px-1">
                      {user.subjects.split(',')[0]}
                    </Chip>
                  ) : <span className="text-sm font-bold text-foreground">None</span>}

                  {user.subjects && user.subjects.split(',').length > 1 && (
                    <Chip size="sm" variant="faded" className="font-semibold">
                      +{user.subjects.split(',').length - 1} more
                    </Chip>
                  )}
                </div>
              </CardBody>
            </Card>
          </div>
        )}

        {/* MENU ITEMS */}
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-default-400 uppercase tracking-widest pl-2">Account Options</h3>
          <Card className="shadow-sm border border-default-100 overflow-hidden">
            <Listbox aria-label="Account Menu" disabledKeys={["v"]} className="p-0 gap-0 divide-y divide-default-100">
              {menuItems.map((item) => (
                <ListboxItem
                  key={item.key}
                  startContent={item.icon}
                  className="px-6 py-4 data-[hover=true]:bg-default-50 rounded-none h-14"
                  textValue={item.label}
                >
                  <span className="font-semibold text-foreground text-sm ml-2">{item.label}</span>
                </ListboxItem>
              ))}
            </Listbox>
          </Card>
        </div>

        {/* LOG OUT */}
        <Button
          variant="bordered"
          color="danger"
          size="lg"
          className="w-full font-bold shadow-sm bg-white"
          startContent={<LogOut size={20} />}
          onPress={() => signOut({ callbackUrl: "/auth/login" })}
        >
          Log Out
        </Button>

        <div className="text-center pb-6 pt-4">
          <p className="text-[10px] text-default-400 font-medium uppercase tracking-widest">AcademiaConnect v1.0.4</p>
        </div>
      </div>

      {/* TUTOR APPLICATION WIDGET */}
      <TutorApplicationModal
        isOpen={isApplicationOpen}
        onClose={() => setIsApplicationOpen(false)}
        onSuccess={handleApplicationSuccess}
      />

    </div>
  );
}