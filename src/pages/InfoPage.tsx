import { Icon } from '@iconify/react';
import { GIFT_CONFIGS } from '../config/gifts';
import { COLLECTIBLE_CONFIGS } from '../config/collectibles';
import type { GiftLevel } from '../types/gift';

interface ChipProps {
  icon: string;
  color: string;
  label: string;
  dimmed?: boolean;
}

function Chip({ icon, color, label, dimmed = false }: ChipProps): JSX.Element {
  return (
    <div
      className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5 relative"
      style={{
        background: dimmed ? `${color}44` : `${color}aa`,
        border: dimmed ? `1.5px dashed ${color}99` : `1px solid ${color}cc`,
        minWidth: 44,
      }}
    >
      <Icon
        icon={icon}
        width={dimmed ? 18 : 22}
        height={dimmed ? 18 : 22}
        style={{ opacity: dimmed ? 0.8 : 1 }}
      />
      <span
        className="text-[9px] font-semibold leading-none text-center"
        style={{ color: '#2a2620', maxWidth: 52 }}
      >
        {label}
      </span>
    </div>
  );
}

interface IntermediateChipProps {
  icon: string;
  color: string;
  level: number;
  stage: 1 | 2;
}

function IntermediateChip({ icon, color, level, stage }: IntermediateChipProps): JSX.Element {
  const badge = stage === 2 ? 'ph:circle-three-quarters-fill' : 'ph:circle-half-fill';
  return (
    <div
      className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5"
      style={{
        background: `${color}${stage === 2 ? 'aa' : '77'}`,
        border: `1px solid ${color}cc`,
        minWidth: 44,
      }}
    >
      <div className="relative">
        <Icon icon={icon} width={22} height={22} style={{ opacity: stage === 2 ? 0.9 : 0.75 }} />
        <div
          className="absolute -bottom-1 -right-1 rounded-full flex items-center justify-center"
          style={{ background: '#fff', width: 12, height: 12, boxShadow: '0 0 0 1px rgba(0,0,0,0.08)' }}
        >
          <Icon icon={badge} width={9} height={9} style={{ color: '#4a413a' }} />
        </div>
      </div>
      <span
        className="text-[9px] font-semibold leading-none text-center"
        style={{ color: '#2a2620', maxWidth: 52 }}
      >
        {`Промеж. ${level}`}
      </span>
    </div>
  );
}

function Arrow(): JSX.Element {
  return (
    <Icon icon="ph:arrow-right-bold" width={14} height={14} style={{ color: '#c9b9a8', flexShrink: 0 }} />
  );
}

function Plus(): JSX.Element {
  return (
    <span className="text-[13px] font-bold" style={{ color: '#c9b9a8', flexShrink: 0 }}>+</span>
  );
}

function SectionCard({ children, title }: { children: React.ReactNode; title?: string }): JSX.Element {
  return (
    <div
      className="rounded-2xl p-4"
      style={{
        background: 'rgba(255,255,255,0.72)',
        border: '1px solid rgba(229,223,214,0.7)',
        boxShadow: '0 2px 12px rgba(42,38,32,0.06)',
      }}
    >
      {title ? (
        <p className="text-xs font-semibold mb-3" style={{ color: '#c9b9a8', letterSpacing: '0.04em', textTransform: 'uppercase' }}>
          {title}
        </p>
      ) : null}
      {children}
    </div>
  );
}

const SIMPLE_LEVELS: GiftLevel[] = [1, 2, 3, 4, 5];
const ONE_STAGE_LEVELS: GiftLevel[] = [6, 7];
const TWO_STAGE_LEVELS: GiftLevel[] = [8, 9, 10];

export function InfoPage(): JSX.Element {
  return (
    <div className="px-4 pt-4 pb-6 flex flex-col gap-4">
      {/* Заголовок */}
      <div>
        <h1 className="text-2xl font-bold mb-1" style={{ color: '#2a2620' }}>Как играть</h1>
        <p className="text-sm leading-relaxed" style={{ color: 'rgba(42,38,32,0.6)' }}>
          Создавай части подарков, объединяй одинаковые — получай готовые подарки.
          Соедини два подарка 10 уровня и получи редкую коллекционку.
        </p>
      </div>

      {/* Уровни 1-5: простые */}
      <SectionCard title="Уровни 1-5 — простые подарки">
        <div className="flex flex-col gap-2.5">
          {SIMPLE_LEVELS.map((lvl) => {
            const cfg = GIFT_CONFIGS[lvl];
            return (
              <div key={lvl} className="flex items-center gap-2 flex-wrap">
                <Chip icon={cfg.icon} color={cfg.color} label={`Часть ${lvl}`} dimmed />
                <Plus />
                <Chip icon={cfg.icon} color={cfg.color} label={`Часть ${lvl}`} dimmed />
                <Arrow />
                <Chip icon={cfg.icon} color={cfg.color} label={`Подарок ${lvl}`} />
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Уровни 6-7: один промежуточный */}
      <SectionCard title="Уровни 6-7 — один промежуточный этап">
        <div className="flex flex-col gap-2.5">
          {ONE_STAGE_LEVELS.map((lvl) => {
            const cfg = GIFT_CONFIGS[lvl];
            return (
              <div key={lvl} className="flex items-center gap-2 flex-wrap">
                <Chip icon={cfg.icon} color={cfg.color} label={`Часть ${lvl}`} dimmed />
                <Plus />
                <Chip icon={cfg.icon} color={cfg.color} label={`Часть ${lvl}`} dimmed />
                <Arrow />
                <IntermediateChip icon={cfg.icon} color={cfg.color} level={lvl} stage={1} />
                <Plus />
                <IntermediateChip icon={cfg.icon} color={cfg.color} level={lvl} stage={1} />
                <Arrow />
                <Chip icon={cfg.icon} color={cfg.color} label={`Подарок ${lvl}`} />
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Уровни 8-10: два промежуточных */}
      <SectionCard title="Уровни 8-10 — два промежуточных этапа">
        <div className="flex flex-col gap-2.5">
          {TWO_STAGE_LEVELS.map((lvl) => {
            const cfg = GIFT_CONFIGS[lvl];
            return (
              <div key={lvl} className="flex items-center gap-2 flex-wrap">
                <Chip icon={cfg.icon} color={cfg.color} label={`Часть ${lvl}`} dimmed />
                <Plus />
                <Chip icon={cfg.icon} color={cfg.color} label={`Часть ${lvl}`} dimmed />
                <Arrow />
                <IntermediateChip icon={cfg.icon} color={cfg.color} level={lvl} stage={1} />
                <Plus />
                <IntermediateChip icon={cfg.icon} color={cfg.color} level={lvl} stage={1} />
                <Arrow />
                <IntermediateChip icon={cfg.icon} color={cfg.color} level={lvl} stage={2} />
                <Plus />
                <IntermediateChip icon={cfg.icon} color={cfg.color} level={lvl} stage={2} />
                <Arrow />
                <Chip icon={cfg.icon} color={cfg.color} label={`Подарок ${lvl}`} />
              </div>
            );
          })}
        </div>
      </SectionCard>

      {/* Мёрдж готовых подарков */}
      <SectionCard title="Мёрдж подарков (как 2048)">
        <div className="flex flex-col gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <Chip icon={GIFT_CONFIGS[1].icon} color={GIFT_CONFIGS[1].color} label="Подарок N" />
            <Plus />
            <Chip icon={GIFT_CONFIGS[1].icon} color={GIFT_CONFIGS[1].color} label="Подарок N" />
            <Arrow />
            <Chip icon={GIFT_CONFIGS[2].icon} color={GIFT_CONFIGS[2].color} label="Подарок N+1" />
          </div>
          <p className="text-xs mt-1" style={{ color: 'rgba(42,38,32,0.5)' }}>
            Два одинаковых готовых подарка сливаются в один следующего уровня — до 9-го.
          </p>
        </div>
      </SectionCard>

      {/* Lvl 10 → коллекционка */}
      <SectionCard title="Топ-мёрдж — коллекционки">
        <div className="flex flex-col gap-3">
          {/* lvl10 + lvl10 → коллекционка */}
          <div className="flex items-center gap-2 flex-wrap">
            <Chip icon={GIFT_CONFIGS[10].icon} color={GIFT_CONFIGS[10].color} label="Подарок 10" />
            <Plus />
            <Chip icon={GIFT_CONFIGS[10].icon} color={GIFT_CONFIGS[10].color} label="Подарок 10" />
            <Arrow />
            <div
              className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5"
              style={{
                background: 'rgba(255,215,0,0.15)',
                border: '1px solid rgba(255,215,0,0.5)',
                minWidth: 54,
              }}
            >
              <Icon icon="ph:sparkle-fill" width={22} height={22} style={{ color: '#D4A820' }} />
              <span className="text-[9px] font-semibold leading-none" style={{ color: '#2a2620' }}>
                Коллекционка
              </span>
              <span className="text-[9px] leading-none" style={{ color: '#D4A820' }}>+10 ⚡</span>
            </div>
          </div>

          {/* 2 одинаковые коллекционки */}
          <div className="flex items-center gap-2 flex-wrap">
            {[COLLECTIBLE_CONFIGS['col_1'], COLLECTIBLE_CONFIGS['col_1']].map((cfg, i) => (
              <div key={i} className="flex items-center gap-2">
                <Chip icon={cfg.icon} color={cfg.color} label={cfg.name} />
                {i === 0 ? <Plus /> : null}
              </div>
            ))}
            <Arrow />
            <div
              className="flex flex-col items-center gap-0.5 rounded-xl px-2 py-1.5"
              style={{
                background: 'rgba(232,180,160,0.2)',
                border: '1px solid rgba(232,180,160,0.6)',
                minWidth: 54,
              }}
            >
              <Icon icon="ph:lightning-fill" width={22} height={22} style={{ color: '#E8B4A0' }} />
              <span className="text-[9px] font-semibold leading-none" style={{ color: '#2a2620' }}>
                +50 ⚡
              </span>
              <span className="text-[9px] leading-none" style={{ color: '#9e8a7a' }}>+2000 XP</span>
            </div>
          </div>
          <p className="text-xs" style={{ color: 'rgba(42,38,32,0.5)' }}>
            Одинаковые коллекционки сливаются и дают большую награду.
          </p>
        </div>
      </SectionCard>

      {/* Коллекционки */}
      <SectionCard title="Коллекционки — 10 редких предметов">
        <div className="grid grid-cols-5 gap-2.5">
          {Object.values(COLLECTIBLE_CONFIGS).map((cfg) => (
            <div key={cfg.id} className="flex flex-col items-center gap-1">
              <div
                className="rounded-2xl flex items-center justify-center relative"
                style={{
                  width: 52,
                  height: 52,
                  background: `linear-gradient(135deg, ${cfg.color}ee 0%, ${cfg.color}aa 100%)`,
                  border: '1.5px solid #E8B97A',
                  boxShadow: `0 3px 10px ${cfg.color}55, inset 0 1px 0 rgba(255,255,255,0.5)`,
                }}
              >
                <Icon icon={cfg.icon} width={34} height={34} />
                <span
                  className="absolute -top-1 -right-1 flex items-center justify-center rounded-full"
                  style={{
                    width: 16,
                    height: 16,
                    background: 'linear-gradient(135deg, #FFE8A0, #E8B97A)',
                    boxShadow: '0 1px 4px rgba(232,185,122,0.6)',
                  }}
                >
                  <Icon icon="ph:sparkle-fill" width={9} height={9} style={{ color: '#fff' }} />
                </span>
              </div>
              <span className="text-[10px] font-semibold text-center leading-tight" style={{ color: '#2a2620' }}>
                {cfg.name}
              </span>
            </div>
          ))}
        </div>
        <p className="text-xs mt-3" style={{ color: 'rgba(42,38,32,0.5)' }}>
          Коллекционки нельзя продать — только объединить с такой же.
        </p>
      </SectionCard>

      {/* Быстрая справка */}
      <SectionCard>
        <div className="flex flex-col gap-2">
          {[
            { icon: 'ph:lightning-fill', color: '#E8B4A0', text: 'Тап "Создать" тратит 1 ⚡ и роняет часть подарка на поле' },
            { icon: 'ph:arrow-square-in', color: '#B0D4C0', text: 'Перетащи одинаковые предметы друг на друга — мёрдж' },
            { icon: 'ph:hand-coins-fill', color: '#A8C8D4', text: 'Продай готовый подарок за +1 ⚡ или часть бесплатно' },
            { icon: 'ph:star-four-fill', color: '#D4A8C8', text: 'Каждые 4 минуты энергия восполняется на 1 единицу' },
          ].map(({ icon, color, text }) => (
            <div key={icon} className="flex items-start gap-2.5">
              <div
                className="flex-shrink-0 rounded-lg flex items-center justify-center mt-0.5"
                style={{ width: 28, height: 28, background: `${color}33` }}
              >
                <Icon icon={icon} width={15} height={15} style={{ color }} />
              </div>
              <p className="text-xs leading-relaxed" style={{ color: 'rgba(42,38,32,0.7)' }}>{text}</p>
            </div>
          ))}
        </div>
      </SectionCard>
    </div>
  );
}
