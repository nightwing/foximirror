#NoEnv
SetBatchLines -1

CoordMode Mouse, Screen
OnExit GuiClose

  zoom = 9                ; initial magnification, 1..32
  halfside = 128          ; circa halfside of the magnifier
  oldcolor = 0
  part := halfside/zoom
  Rz := Round(part)
  R := Rz*zoom
  LineMargin := 10
                        ; GUI 2 shows the magnified image
Gui +AlwaysOnTop  +Resize +ToolWindow ;-Caption +E0x20
Gui, Font, underline
Gui, Add, Text, cBlue gCopyColor, gcolor
Gui, Font, norm

Gui Show, % "w" 2*R+zoom+3 " h" 2*R+zoom+3 " x0 y0", Magnifier


WinGet MagnifierID, id,  Magnifier
;WinSet Transparent, 255, Magnifier ; makes the window invisible to magnification
WinGet PrintSourceID, ID


hdd_frame := DllCall("GetDC", UInt, PrintSourceID)
hdc_frame := DllCall("GetDC", UInt, MagnifierID)


;#############   draw cross lines   ###########################################
DrawCross(M_C, r, z, dc){
        ;specify the style, thickness and color of the cross lines
    h_pen := DllCall( "gdi32.dll\CreatePen", Int, 0, Int, 1, UInt, 0x0000FF)
        ;select the correct pen into DC
    DllCall( "gdi32.dll\SelectObject", UInt, dc, "uint", h_pen )
        ;update the current position to specified point - 1st horizontal
    DllCall( "gdi32.dll\MoveToEx", UInt, dc, Int, r,   Int, r, UInt, 0)
    DllCall( "gdi32.dll\LineTo"  , UInt, dc, Int, r,   Int, r+z)
	DllCall( "gdi32.dll\LineTo"  , UInt, dc, Int, r+z, Int, r+z)
	DllCall( "gdi32.dll\LineTo"  , UInt, dc, Int, r+z, Int, r)
	DllCall( "gdi32.dll\LineTo"  , UInt, dc, Int, r,   Int, r)
}

DrawMask( M_C , R_C, zoom_c, dc ){
	; xz := In(x-Rz-6,0,A_ScreenWidth-2*Rz) ; keep the frame on screen
	DllCall("gdi32.dll\BitBlt", UInt,dc, Int,R_C+M_C-1, Int,R_C+M_C, Int,R_C, Int,1
					,UInt,dc, UInt,0, UInt,0, UInt,0x00000042) ; SOLID_BLACK (42)
}




SetTimer Repaint, 50   ; flow through
Repaint:

;WinGet MagnifierID
    MouseGetPos x, y
    xz := x-Rz
    yz := y-Rz
	DllCall("gdi32.dll\StretchBlt", UInt,hdc_frame, Int,0, Int,0, Int,2*R+zoom, Int,2*R+zoom
				, UInt,hdd_frame, UInt,xz, UInt,yz, Int,2*Rz+1, Int,2*Rz+1, UInt,0xCC0020) ; SRCCOPY	
    DrawCross(LineMargin, R, zoom, hdc_frame)                        
    
    color:=DllCall("GetPixel", UInt, hdd_frame, Int, x, Int, y)
	if (color != oldcolor){
		oldcolor = %color%
		colorR:=color & 0xff
		colorG:=(color>>8) & 0xff
		colorB:=(color>>16) & 0xff
		colorStr=% "rgb(" colorR "," colorG "," colorB ")"
		
		WinSetTitle ,ahk_id %MagnifierID%,, %colorStr% "press ctrl+shift+c"
	}
Return


;#############                      ###########################################
getClientRect(byRef x="", byRef y="", byRef w="", byRef h="", hwnd=0) {
	hwnd:=hwnd ? hwnd : WinExist()    ; use LFW if no hwnd given
	VarSetCapacity(rt, 16)            ; alloc. mem. for RECT struc.
	VarSetCapacity(pt, 8, 0)          ; alloc. mem. for POINT struc.
	DllCall("GetClientRect" , "uint", hwnd, "uint", &rt)
	DllCall("ClientToScreen", "uint", hwnd, "uint", &pt)
	x:=NumGet(pt, 0, "int"), y:=NumGet(pt, 4, "int")
	w:=NumGet(rt, 8, "int"), h:=NumGet(rt, 12, "int")
}


OnMessage(0x05, "MsgMonitor") ;WM_SIZE
MsgMonitor(wParam, lParam, msg){    
	; Since returning quickly is often important, it is better to use a ToolTip than
    ; something like MsgBox that would prevent the function from finishing:
    ToolTip Message %msg% arrived:`nWPARAM: %wParam%`nLPARAM: %lParam%

	;SetTimer, RemoveToolTip, 5000
	
	;getClientRect(x, y, w, h, MagnifierID)
}
RemoveToolTip:
SetTimer, RemoveToolTip, Off
ToolTip
return








; key handlers
ESC::
#x::
GuiClose:
    DllCall("gdi32.dll\DeleteDC", UInt,hdc_frame )
    DllCall("gdi32.dll\DeleteDC", UInt,hdd_frame )
ExitApp

;Ctrl ^; Shift +; Win #; Alt !
^NumPadAdd::
^WheelUp::   
    If(zoom < halfside and ( A_ThisHotKey = "^WheelUp" or A_ThisHotKey ="^NumPadAdd") )
		zoom *= 1.189207115         ; sqrt(sqrt(2))
	Gosub,setZoom
return

^NumPadSub::
^WheelDown:: 
    If(zoom >  0.1 and ( A_ThisHotKey = "^WheelDown" or A_ThisHotKey = "^NumPadSub"))
		zoom /= 1.189207115
	Gosub,setZoom
return
^NumPad0::
    zoom=9
	Gosub,setZoom
return
setZoom:
	If((zoom<1&&!antialize)||(zoom>1&&antialize)){
		antialize:=!antialize
		DllCall( "gdi32.dll\SetStretchBltMode", "uint", hdc_frame, "int", 4*antialize )  ; Antializing ?
	}

    part := halfside/zoom           ;new calculation of the magnified image
    Rz := Round(part)
    R := Rz*zoom
	;WinMove Magnifier,,0, 0, 2*R+zoom+3, 2*R+zoom+3
   ; Gui 2:Show, % "w" 2*R+zoom+3 " h" 2*R+zoom+3 " x0 y0", Magnifier
   ; TrayTip,,% "Zoom = " Round(100*zoom) "%"
return
F1::
	MouseGetPos, x, y
	color:=DllCall("GetPixel", UInt, hdd_frame, Int, x, Int, y)
	colorR:=color & 0xff
	colorG:=(color>>8) & 0xff
	colorB:=(color>>16) & 0xff
	colorStr=% "rgb(" colorR "," colorG "," colorB ")"
  	clipboard:=colorStr
	WinSetTitle ,ahk_id %MagnifierID%,, %colorStr% "was copied"
return

#c::
^+c::
CopyColor:
	MouseGetPos, x, y
	color:=DllCall("GetPixel", UInt, hdd_frame, Int, x, Int, y)
	colorR:=color & 0xff
	colorG:=(color>>8) & 0xff
	colorB:=(color>>16) & 0xff
	colorStr=% "rgb(" colorR "," colorG "," colorB ")"
  	clipboard:=colorStr
	WinSetTitle ,ahk_id %MagnifierID%,, %colorStr% "was copied"
return


; Mouse slow down:
; The first parameter is always 0x71 (SPI_SETMOUSESPEED).
; The third parameter is the speed (range is 1-20, 10 is default).
;F9::
;    DllCall("SystemParametersInfo", UInt, 0x71, UInt, 0, UInt, 3, UInt, 0)
;    KeyWait F9  ; This prevents keyboard auto-repeat from doing the DllCall repeatedly.
;return
;
;F9 up::
;    DllCall("SystemParametersInfo", UInt, 0x71, UInt, 0, UInt, 10, UInt, 0)
;Return

;Mouse move one step with arrow keys
#Up::
^Up::
    MouseMove, 0, -1, 0, R
Return

#Down::
^Down::
    MouseMove, 0, 1, 0, R
Return

#Left::
^Left::
    MouseMove, -1, 0, 0, R
Return

#Right::
^Right::
    MouseMove, 1, 0, 0, R
Return



