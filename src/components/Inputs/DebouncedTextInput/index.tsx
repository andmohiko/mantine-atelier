import { useState, useEffect, useRef } from 'react'

import { TextInput as MantineTextInput } from '@mantine/core'

type Props = {
  label?: React.ReactNode
  placeHolder?: string
  value?: string
  onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
  onBlur?: () => void
  error?: React.ReactNode
  /** デバウンス時間（ミリ秒）。デフォルトは3000ms（3秒） */
  debounceMs?: number
}

/**
 * デバウンス機能付きテキスト入力コンポーネント
 * 入力が止まってから指定時間後に外部のonChangeを実行する
 * @param label - ラベル
 * @param placeHolder - プレースホルダー
 * @param value - 外部から受け取る値
 * @param onChange - 値変更時のコールバック関数
 * @param onBlur - フォーカスが外れた時のコールバック関数
 * @param error - エラーメッセージ
 * @param debounceMs - デバウンス時間（ミリ秒）
 * @returns デバウンス機能付きテキスト入力コンポーネント
 */
export const DebouncedTextInput = ({
  label,
  placeHolder,
  value,
  onChange,
  onBlur,
  error,
  debounceMs = 3000,
}: Props): React.ReactNode => {
  // 内部状態で入力値を管理
  const [internalValue, setInternalValue] = useState(value || '')
  // デバウンス用のタイマーIDを保持
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null)

  // 外部のvalueプロップが変更された時に内部状態を同期
  useEffect(() => {
    setInternalValue(value || '')
  }, [value])

  // デバウンス機能の実装
  useEffect(() => {
    // 内部値が外部値と異なる場合のみデバウンス処理を実行
    if (internalValue !== (value || '')) {
      // 既存のタイマーがあればクリア
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
      }

      // 新しいタイマーを設定
      debounceTimerRef.current = setTimeout(() => {
        if (onChange) {
          // 疑似的なChangeEventを作成して外部のonChangeを実行
          const event = {
            target: { value: internalValue },
            currentTarget: { value: internalValue },
          } as React.ChangeEvent<HTMLInputElement>

          onChange(event)
        }
        debounceTimerRef.current = null
      }, debounceMs)
    }

    // クリーンアップ関数：コンポーネントアンマウント時やdepsが変更された時にタイマーをクリア
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current)
        debounceTimerRef.current = null
      }
    }
  }, [internalValue, value, onChange, debounceMs])

  /**
   * 入力値変更時のハンドラー
   * @param event - 入力イベント
   */
  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value
    // 内部状態を即座に更新（UIの反応性を保つため）
    setInternalValue(newValue)
  }

  return (
    <MantineTextInput
      label={label}
      placeholder={placeHolder}
      value={internalValue}
      onChange={handleInputChange}
      onBlur={onBlur}
      error={error}
      size="md"
      w="100%"
    />
  )
}
