import { Component, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Tipocontribuyente } from 'src/app/models/tipocontribuyente';
import { TipocontribuyenteService } from 'src/app/service/tipocontribuyente.service';
import { TokenService } from 'src/app/service/token.service';
import Swal from 'sweetalert2';

@Component({
  selector: 'app-lista-tipocontribuyente',
  templateUrl: './lista-tipocontribuyente.component.html',
  styleUrls: ['./lista-tipocontribuyente.component.css']
})
export class ListaTipocontribuyenteComponent implements OnDestroy {
  protected readonly unsubscribe$ = new Subject<void>();
  tipos: Tipocontribuyente[] = [];
  roles: string[];
  isAdmin = false;
  constructor(
    private tipocontribuyenteService: TipocontribuyenteService,
    private toastr: ToastrService,
    private tokenService: TokenService,
    private router: Router
  ) { }

  ngOnInit() {
    this.cargarTipos();
    this.roles = this.tokenService.getAuthorities();
    this.roles.forEach(rol => {
      if (rol === 'ROLE_ADMIN') {
        this.isAdmin = true;
      }
    });
  }

  cargarTipos(): void {
    this.tipocontribuyenteService.list()
      .pipe(takeUntil(this.unsubscribe$))
      .subscribe((tipos: Tipocontribuyente[]) => {
        this.tipos = tipos;
      },
        err => {
          this.handleWrongResponse();
        });
  }


  handleWrongResponse() {
    this.toastr.error('Error Inesperado', 'Fail', {
      timeOut: 3000, positionClass: 'toast-top-right',
    });
  }


  crear() {
    this.router.navigate(['tipocontribuyente/crear']);
  }

  ver(id_tipo_comprobante: number) {
    this.router.navigate(['tipocontribuyente/ver/' + id_tipo_comprobante]);
  }

  editar(id_tipo_comprobante: number) {
    this.router.navigate(['tipocontribuyente/editar/' + id_tipo_comprobante]);
  }

  borrar(id_tipo_comprobante: number, nombre: string) {
    Swal.fire({
      title: 'Inhabilitar',
      text: '¿Desea inhabilitar tipo de contribuyente ' + nombre + '?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Aceptar'
    }).then((result) => {
      if (result.isConfirmed) {
        this.tipocontribuyenteService.disabled(id_tipo_comprobante)
          .pipe(takeUntil(this.unsubscribe$))
          .subscribe((res: any) => {
            this.handleSuccessResponse(nombre);
            this.cargarTipos();
          },
            err => {
              this.handleWrongResponse();
            });

      } else if (result.isDenied) {
        Swal.fire('Sin cambios', '', 'info')
      }
    })

  }

  handleSuccessResponse(nombre: string) {
    Swal.fire('Tipo contribuyente ' + nombre + ' inhabilitado', '', 'success')
    this.router.navigate(['tipocontribuyente/listar']);
  }


  ngOnDestroy() {
    this.unsubscribe$.next();
    this.unsubscribe$.complete();
  }

}
